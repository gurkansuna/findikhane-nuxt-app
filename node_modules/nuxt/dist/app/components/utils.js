import { renderDiagnostics } from "../diagnostics/render.js";
import { MAX_VFOR_LENGTH } from "./vfor.js";
import { Transition, createStaticVNode, h } from "vue";
import { isArray, isObject, isPromise, isString } from "@vue/shared";
import { defu } from "defu";
import { START_LOCATION } from "#build/pages";
//#region src/app/components/utils.ts
/**
* Internal utility
* @private
*/
const _wrapInTransition = (props, children) => {
	return { default: () => import.meta.client && props ? h(Transition, props === true ? {} : props, children) : children.default?.() };
};
const ROUTE_KEY_PARENTHESES_RE = /(:\w+)\([^)]+\)/g;
const ROUTE_KEY_SYMBOLS_RE = /(:\w+)[?+*]/g;
const ROUTE_KEY_NORMAL_RE = /:\w+/g;
function generateRouteKey(route) {
	const source = route?.meta.key ?? route.path.replace(ROUTE_KEY_PARENTHESES_RE, "$1").replace(ROUTE_KEY_SYMBOLS_RE, "$1").replace(ROUTE_KEY_NORMAL_RE, (r) => route.params[r.slice(1)]?.toString() || "");
	return typeof source === "function" ? source(route) : source;
}
/**
* Utility used within router guards
* return true if the route has been changed with a page change during navigation
*/
function isChangingPage(to, from) {
	if (to === from || from === START_LOCATION) return false;
	if (generateRouteKey(to) !== generateRouteKey(from)) return true;
	if (to.matched.every((comp, index) => comp.components && comp.components.default === from.matched[index]?.components?.default)) return false;
	return true;
}
const VALID_TAG_RE = /^[a-z][a-z0-9-]*$/i;
/** Return `tag` if it is a safe HTML tag name, otherwise `fallback`. */
function sanitizeTag(tag, fallback) {
	return tag && VALID_TAG_RE.test(tag) ? tag : fallback;
}
/**
* create buffer retrieved from @vue/server-renderer
* @see https://github.com/vuejs/core/blob/9617dd4b2abc07a5dc40de6e5b759e851b4d0da1/packages/server-renderer/src/render.ts#L57
* @private
*/
function createBuffer() {
	let appendable = false;
	const buffer = [];
	return {
		getBuffer() {
			return buffer;
		},
		push(item) {
			const isStringItem = isString(item);
			if (appendable && isStringItem) buffer[buffer.length - 1] += item;
			else buffer.push(item);
			appendable = isStringItem;
			if (isPromise(item) || isArray(item) && item.hasAsync) buffer.hasAsync = true;
		}
	};
}
/**
* helper for NuxtIsland to generate a correct array for scoped data
*/
function vforToArray(source) {
	if (isArray(source)) return source;
	else if (isString(source)) return source.split("");
	else if (typeof source === "number") {
		if (import.meta.dev && !Number.isInteger(source)) renderDiagnostics.NUXT_E4013({ source });
		if (import.meta.dev && source > 1e4) renderDiagnostics.NUXT_E4017({
			source,
			max: MAX_VFOR_LENGTH
		});
		const length = source > 1e4 ? MAX_VFOR_LENGTH : source;
		const array = [];
		for (let i = 0; i < length; i++) array[i] = i;
		return array;
	} else if (isObject(source)) if (source[Symbol.iterator]) return Array.from(source, (item) => item);
	else {
		const keys = Object.keys(source);
		const array = new Array(keys.length);
		for (let i = 0, l = keys.length; i < l; i++) {
			const key = keys[i];
			array[i] = source[key];
		}
		return array;
	}
	return [];
}
/**
* Retrieve the HTML content from an element
* Handles `<!--[-->` Fragment elements
* @param element the element to retrieve the HTML
* @param withoutSlots purge all slots from the HTML string retrieved
* @returns {string[]|undefined} An array of string which represent the content of each element. Use `.join('')` to retrieve a component vnode.el HTML
*/
function getFragmentHTML(element, withoutSlots = false) {
	if (element) {
		if (element.nodeName === "#comment" && element.nodeValue === "[") return getFragmentChildren(element, [], withoutSlots);
		if (withoutSlots) {
			const clone = element.cloneNode(true);
			clone.querySelectorAll("[data-island-slot]").forEach((n) => {
				n.innerHTML = "";
			});
			return [clone.outerHTML];
		}
		return [element.outerHTML];
	}
}
function getFragmentChildren(element, blocks = [], withoutSlots = false) {
	if (element && element.nodeName) {
		if (isEndFragment(element)) return blocks;
		else if (!isStartFragment(element)) {
			const clone = element.cloneNode(true);
			if (withoutSlots) clone.querySelectorAll?.("[data-island-slot]").forEach((n) => {
				n.innerHTML = "";
			});
			blocks.push(clone.outerHTML);
		}
		getFragmentChildren(element.nextSibling, blocks, withoutSlots);
	}
	return blocks;
}
/**
* Return a static vnode from an element
* Default to a div if the element is not found and if a fallback is not provided
* @param el renderer node retrieved from the component internal instance
* @param staticNodeFallback fallback string to use if the element is not found. Must be a valid HTML string
*/
function elToStaticVNode(el, staticNodeFallback) {
	const fragment = el ? getFragmentHTML(el) : staticNodeFallback ? [staticNodeFallback] : void 0;
	if (fragment) return createStaticVNode(fragment.join(""), fragment.length);
	return h("div");
}
function isStartFragment(element) {
	return element.nodeName === "#comment" && element.nodeValue === "[";
}
function isEndFragment(element) {
	return element.nodeName === "#comment" && element.nodeValue === "]";
}
function toArray(value) {
	return Array.isArray(value) ? value : [value];
}
/**
* Internal utility
* @private
*/
function _mergeTransitionProps(routeProps) {
	const _props = [];
	for (const prop of routeProps) {
		if (!prop) continue;
		_props.push({
			...prop,
			onAfterLeave: prop.onAfterLeave ? toArray(prop.onAfterLeave) : void 0,
			onBeforeLeave: prop.onBeforeLeave ? toArray(prop.onBeforeLeave) : void 0
		});
	}
	return defu(..._props);
}
//#endregion
export { _mergeTransitionProps, _wrapInTransition, createBuffer, elToStaticVNode, getFragmentHTML, isChangingPage, isEndFragment, isStartFragment, sanitizeTag, toArray, vforToArray };
