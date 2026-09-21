const kInjected = "__unctx_injected__";
const AWAIT_RE = /(?<![\w$.])await(?![\w$])/;
function getTransformFilter(options = {}) {
	const asyncFunctions = options.asyncFunctions ?? ["withAsyncContext"];
	const objectDefinitionFunctions = Object.keys(options.objectDefinitions ?? {});
	return { code: new RegExp(`\\b(${[...asyncFunctions, ...objectDefinitionFunctions].join("|")})\\(`) };
}
async function loadParseSync() {
	try {
		return (await import("oxc-parser")).parseSync;
	} catch (oxcError) {
		try {
			return (await import("rolldown/utils")).parseSync;
		} catch (rolldownError) {
			throw new Error("[unctx] Cannot load an oxc parser. Install `oxc-parser` (or `rolldown`, which re-exports it) to use the unctx transform.", { cause: new AggregateError([oxcError, rolldownError], "Failed to import `oxc-parser` and `rolldown/utils`") });
		}
	}
}
async function createTransformer(options = {}) {
	options = {
		asyncFunctions: ["withAsyncContext"],
		helperModule: "unctx",
		helperName: "executeAsync",
		objectDefinitions: {},
		...options
	};
	const [parseSync, MagicString] = await Promise.all([loadParseSync(), import("magic-string").then((r) => r.default)]);
	const objectDefinitionFunctions = Object.keys(options.objectDefinitions);
	const filter = getTransformFilter(options);
	const matchRE = filter.code;
	function shouldTransform(code) {
		return typeof code === "string" && matchRE.test(code) && AWAIT_RE.test(code);
	}
	function transform(code, options_ = {}) {
		if (!options_.force && !shouldTransform(code)) return;
		const parsed = parseSync("", code, { sourceType: "module" });
		if (parsed.errors.length > 0) throw new SyntaxError(parsed.errors.map((error) => error.message).join("\n"));
		const s = new MagicString(code);
		let detected = false;
		walk(parsed.program, function(node) {
			if (node.type === "CallExpression") {
				const functionName = _getFunctionName(node.callee);
				if (options.asyncFunctions.includes(functionName)) {
					transformFunctionArguments(node);
					if (functionName !== "callAsync") {
						const lastArgument = node.arguments[node.arguments.length - 1];
						if (lastArgument) s.appendRight(lastArgument.end, ",1");
					}
				}
				if (objectDefinitionFunctions.includes(functionName)) for (const argument of node.arguments) {
					if (argument.type !== "ObjectExpression") continue;
					for (const property of argument.properties) {
						if (property.type !== "Property" || property.key.type !== "Identifier") continue;
						if (options.objectDefinitions[functionName]?.includes(property.key?.name)) transformFunctionBody(property.value);
					}
				}
			}
		});
		if (!detected) return;
		s.appendLeft(0, `import { ${options.helperName} as __executeAsync } from ${JSON.stringify(options.helperModule)};`);
		return {
			code: s.toString(),
			magicString: s
		};
		function transformFunctionBody(function_) {
			if (function_.type !== "ArrowFunctionExpression" && function_.type !== "FunctionExpression") return;
			if (!function_.async) return;
			const body = function_.body;
			if (!body) return;
			let injectVariable = false;
			walk(body, function(node, parent) {
				if (node.type === "AwaitExpression" && !node[kInjected]) {
					detected = true;
					injectVariable = true;
					injectForNode(node, parent);
				} else if (node.type === "IfStatement" && node.consequent.type === "ExpressionStatement" && node.consequent.expression.type === "AwaitExpression") {
					detected = true;
					injectVariable = true;
					node.consequent.expression[kInjected] = true;
					injectForNode(node.consequent.expression, node);
				}
				if (node.type === "ArrowFunctionExpression" || node.type === "FunctionExpression" || node.type === "FunctionDeclaration") return this.skip();
			});
			if (injectVariable) {
				if (body.type === "BlockStatement") s.appendLeft(body.start + 1, "let __temp, __restore;");
				else {
					s.appendLeft(body.start, "{let __temp, __restore; return (");
					s.appendRight(body.end, ");}");
				}
			}
		}
		function transformFunctionArguments(node) {
			for (const function_ of node.arguments) transformFunctionBody(function_);
		}
		function injectForNode(node, parent) {
			const isStatement = parent?.type === "ExpressionStatement";
			s.remove(node.start, node.argument.start);
			s.remove(node.end, node.argument.end);
			s.appendLeft(node.argument.start, isStatement ? `;(([__temp,__restore]=__executeAsync(()=>` : `(([__temp,__restore]=__executeAsync(()=>`);
			s.appendRight(node.argument.end, isStatement ? `)),await __temp,__restore());` : `)),__temp=await __temp,__restore(),__temp)`);
		}
	}
	return {
		transform,
		filter,
		shouldTransform
	};
}
function _getFunctionName(node) {
	if (node.type === "Identifier") return node.name;
	else if (node.type === "MemberExpression") return _getFunctionName(node.property);
	return "";
}
function walk(root, enter) {
	const visit = (node, parent) => {
		let skipped = false;
		enter.call({ skip: () => {
			skipped = true;
		} }, node, parent);
		if (skipped) return;
		for (const key in node) {
			const value = node[key];
			if (Array.isArray(value)) {
				for (const child of value) if (isNode(child)) visit(child, node);
			} else if (isNode(value)) visit(value, node);
		}
	};
	visit(root, null);
}
function isNode(value) {
	return typeof value === "object" && value !== null && typeof value.type === "string";
}
export { createTransformer, getTransformFilter };
