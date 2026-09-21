//#region ../nuxt/src/app/internal/tracing.ts
let _channels;
function getChannel(name) {
	_channels ??= {};
	if (name in _channels) return _channels[name];
	const dc = globalThis.process?.getBuiltinModule?.("node:diagnostics_channel");
	const channel = dc?.tracingChannel ? dc.tracingChannel(name) : null;
	_channels[name] = channel;
	return channel;
}
function traceAsync(name, context, fn) {
	const channel = getChannel(name);
	if (!channel || channel.hasSubscribers === false) return fn();
	return channel.tracePromise(fn, context);
}
//#endregion
export { traceAsync };
