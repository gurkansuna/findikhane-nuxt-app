import { useNuxtApp } from "../nuxt.js";
import { injectHead } from "../../head/runtime/composables.js";
import "./head.js";
import { getCurrentScope, onScopeDispose, shallowRef } from "vue";
//#region src/app/composables/route-announcer.ts
function createRouteAnnouncer(opts = {}) {
	const message = shallowRef("");
	const politeness = shallowRef(opts.politeness || "polite");
	const activeHead = injectHead();
	function set(messageValue = "", politenessSetting = "polite") {
		message.value = messageValue;
		politeness.value = politenessSetting;
	}
	function polite(msg) {
		set(msg, "polite");
	}
	function assertive(msg) {
		set(msg, "assertive");
	}
	function _updateMessageWithPageHeading() {
		set(document?.title?.trim(), politeness.value);
	}
	function _cleanup() {
		activeHead?.hooks?.removeHook("dom:rendered", _updateMessageWithPageHeading);
	}
	_updateMessageWithPageHeading();
	activeHead?.hooks?.hook("dom:rendered", _updateMessageWithPageHeading);
	return {
		_cleanup,
		message,
		politeness,
		set,
		polite,
		assertive
	};
}
/**
* composable to handle the route announcer
* @since 3.12.0
*/
function useRouteAnnouncer(opts = {}) {
	const nuxtApp = useNuxtApp();
	const announcer = nuxtApp._routeAnnouncer ||= createRouteAnnouncer(opts);
	if (opts.politeness && opts.politeness !== announcer.politeness.value) announcer.politeness.value = opts.politeness;
	if (import.meta.client && getCurrentScope()) {
		nuxtApp._routeAnnouncerDeps ||= 0;
		nuxtApp._routeAnnouncerDeps++;
		onScopeDispose(() => {
			nuxtApp._routeAnnouncerDeps--;
			if (nuxtApp._routeAnnouncerDeps === 0) {
				announcer._cleanup();
				delete nuxtApp._routeAnnouncer;
			}
		});
	}
	return announcer;
}
//#endregion
export { useRouteAnnouncer };
