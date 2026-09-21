import { createError } from "./error.js";
//#region src/app/composables/script-stubs.ts
function renderStubMessage(name) {
	const message = `\`${name}\` is provided by @nuxt/scripts. Check your console to install it or run 'npx nuxt module add @nuxt/scripts' to install it.`;
	if (import.meta.client) throw createError({
		fatal: true,
		status: 500,
		statusText: message
	});
}
function useScript(input, options) {
	renderStubMessage("useScript");
}
function useScriptTriggerElement(...args) {
	renderStubMessage("useScriptTriggerElement");
}
function useScriptTriggerConsent(...args) {
	renderStubMessage("useScriptTriggerConsent");
}
function useScriptEventPage(...args) {
	renderStubMessage("useScriptEventPage");
}
function useScriptGoogleAnalytics(...args) {
	renderStubMessage("useScriptGoogleAnalytics");
}
function useScriptPlausibleAnalytics(...args) {
	renderStubMessage("useScriptPlausibleAnalytics");
}
function useScriptCloudflareWebAnalytics(...args) {
	renderStubMessage("useScriptCloudflareWebAnalytics");
}
function useScriptCrisp(...args) {
	renderStubMessage("useScriptCrisp");
}
function useScriptFathomAnalytics(...args) {
	renderStubMessage("useScriptFathomAnalytics");
}
function useScriptMatomoAnalytics(...args) {
	renderStubMessage("useScriptMatomoAnalytics");
}
function useScriptGoogleTagManager(...args) {
	renderStubMessage("useScriptGoogleTagManager");
}
function useScriptSegment(...args) {
	renderStubMessage("useScriptSegment");
}
function useScriptClarity(...args) {
	renderStubMessage("useScriptClarity");
}
function useScriptMetaPixel(...args) {
	renderStubMessage("useScriptMetaPixel");
}
function useScriptXPixel(...args) {
	renderStubMessage("useScriptXPixel");
}
function useScriptIntercom(...args) {
	renderStubMessage("useScriptIntercom");
}
function useScriptHotjar(...args) {
	renderStubMessage("useScriptHotjar");
}
function useScriptStripe(...args) {
	renderStubMessage("useScriptStripe");
}
function useScriptLemonSqueezy(...args) {
	renderStubMessage("useScriptLemonSqueezy");
}
function useScriptVimeoPlayer(...args) {
	renderStubMessage("useScriptVimeoPlayer");
}
function useScriptGoogleMaps(...args) {
	renderStubMessage("useScriptGoogleMaps");
}
function useScriptNpm(...args) {
	renderStubMessage("useScriptNpm");
}
function useScriptGoogleAdsense(...args) {
	renderStubMessage("useScriptGoogleAdsense");
}
function useScriptYouTubePlayer(...args) {
	renderStubMessage("useScriptYouTubePlayer");
}
function useScriptUmamiAnalytics(...args) {
	renderStubMessage("useScriptUmamiAnalytics");
}
function useScriptSnapchatPixel(...args) {
	renderStubMessage("useScriptSnapchatPixel");
}
function useScriptRybbitAnalytics(...args) {
	renderStubMessage("useScriptRybbitAnalytics");
}
function useScriptDatabuddyAnalytics(...args) {
	renderStubMessage("useScriptDatabuddyAnalytics");
}
function useScriptRedditPixel(...args) {
	renderStubMessage("useScriptRedditPixel");
}
function useScriptPayPal(...args) {
	renderStubMessage("useScriptPayPal");
}
function useScriptVercelAnalytics(...args) {
	renderStubMessage("useScriptVercelAnalytics");
}
function useScriptPostHog(...args) {
	renderStubMessage("useScriptPostHog");
}
function useScriptMixpanelAnalytics(...args) {
	renderStubMessage("useScriptMixpanelAnalytics");
}
function useScriptBingUet(...args) {
	renderStubMessage("useScriptBingUet");
}
function useScriptTikTokPixel(...args) {
	renderStubMessage("useScriptTikTokPixel");
}
function useScriptGoogleRecaptcha(...args) {
	renderStubMessage("useScriptGoogleRecaptcha");
}
function useScriptGoogleSignIn(...args) {
	renderStubMessage("useScriptGoogleSignIn");
}
function useScriptGravatar(...args) {
	renderStubMessage("useScriptGravatar");
}
function useScriptAhrefsAnalytics(...args) {
	renderStubMessage("useScriptAhrefsAnalytics");
}
function useScriptLinkedInInsight(...args) {
	renderStubMessage("useScriptLinkedInInsight");
}
function useScriptCalendly(...args) {
	renderStubMessage("useScriptCalendly");
}
function useScriptUsercentrics(...args) {
	renderStubMessage("useScriptUsercentrics");
}
function useScriptSpeedCurve(...args) {
	renderStubMessage("useScriptSpeedCurve");
}
//#endregion
export { useScript, useScriptAhrefsAnalytics, useScriptBingUet, useScriptCalendly, useScriptClarity, useScriptCloudflareWebAnalytics, useScriptCrisp, useScriptDatabuddyAnalytics, useScriptEventPage, useScriptFathomAnalytics, useScriptGoogleAdsense, useScriptGoogleAnalytics, useScriptGoogleMaps, useScriptGoogleRecaptcha, useScriptGoogleSignIn, useScriptGoogleTagManager, useScriptGravatar, useScriptHotjar, useScriptIntercom, useScriptLemonSqueezy, useScriptLinkedInInsight, useScriptMatomoAnalytics, useScriptMetaPixel, useScriptMixpanelAnalytics, useScriptNpm, useScriptPayPal, useScriptPlausibleAnalytics, useScriptPostHog, useScriptRedditPixel, useScriptRybbitAnalytics, useScriptSegment, useScriptSnapchatPixel, useScriptSpeedCurve, useScriptStripe, useScriptTikTokPixel, useScriptTriggerConsent, useScriptTriggerElement, useScriptUmamiAnalytics, useScriptUsercentrics, useScriptVercelAnalytics, useScriptVimeoPlayer, useScriptXPixel, useScriptYouTubePlayer };
