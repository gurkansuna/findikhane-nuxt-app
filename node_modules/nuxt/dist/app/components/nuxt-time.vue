<script setup>
import { computed, getCurrentInstance, onBeforeUnmount, ref } from "vue";
import { onPrehydrate } from "../composables/ssr";
import { useNuxtApp } from "../nuxt";
const props = defineProps({
	locale: {
		type: String,
		required: false
	},
	datetime: {
		type: [
			String,
			Number,
			Date
		],
		required: true
	},
	localeMatcher: {
		type: String,
		required: false
	},
	weekday: {
		type: String,
		required: false
	},
	era: {
		type: String,
		required: false
	},
	year: {
		type: String,
		required: false
	},
	month: {
		type: String,
		required: false
	},
	day: {
		type: String,
		required: false
	},
	hour: {
		type: String,
		required: false
	},
	minute: {
		type: String,
		required: false
	},
	second: {
		type: String,
		required: false
	},
	timeZoneName: {
		type: String,
		required: false
	},
	formatMatcher: {
		type: String,
		required: false
	},
	hour12: {
		type: Boolean,
		required: false,
		default: undefined
	},
	timeZone: {
		type: String,
		required: false
	},
	calendar: {
		type: String,
		required: false
	},
	dayPeriod: {
		type: String,
		required: false
	},
	numberingSystem: {
		type: String,
		required: false
	},
	dateStyle: {
		type: String,
		required: false
	},
	timeStyle: {
		type: String,
		required: false
	},
	hourCycle: {
		type: String,
		required: false
	},
	relative: {
		type: Boolean,
		required: false
	},
	numeric: {
		type: String,
		required: false
	},
	relativeStyle: {
		type: String,
		required: false
	},
	title: {
		type: [Boolean, String],
		required: false
	}
});
const el = getCurrentInstance()?.vnode.el;
const renderedDate = el?.getAttribute("datetime");
const _locale = el?.getAttribute("data-locale");
const nuxtApp = useNuxtApp();
const date = computed(() => {
	const date = props.datetime;
	if (renderedDate && nuxtApp.isHydrating) {
		return new Date(renderedDate);
	}
	if (!props.datetime) {
		return new Date();
	}
	return new Date(date);
});
const now = ref(import.meta.client && nuxtApp.isHydrating && window._nuxtTimeNow ? new Date(window._nuxtTimeNow) : new Date());
if (import.meta.client && props.relative) {
	const handler = () => {
		now.value = new Date();
	};
	const interval = setInterval(handler, 1e3);
	onBeforeUnmount(() => clearInterval(interval));
}
const formatter = computed(() => {
	const { locale: propsLocale, relative, relativeStyle, ...rest } = props;
	if (relative) {
		return new Intl.RelativeTimeFormat(_locale ?? propsLocale, {
			...rest,
			style: relativeStyle
		});
	}
	return new Intl.DateTimeFormat(_locale ?? propsLocale, rest);
});
const formattedDate = computed(() => {
	if (isInvalidDate.value) {
		return date.value.toString();
	}
	if (!props.relative) {
		return formatter.value.format(date.value);
	}
	const diffInSeconds = (date.value.getTime() - now.value.getTime()) / 1e3;
	const units = [
		{
			unit: "second",
			seconds: 1,
			threshold: 60
		},
		{
			unit: "minute",
			seconds: 60,
			threshold: 60
		},
		{
			unit: "hour",
			seconds: 3600,
			threshold: 24
		},
		{
			unit: "day",
			seconds: 86400,
			threshold: 30
		},
		{
			unit: "month",
			seconds: 2592e3,
			threshold: 12
		},
		{
			unit: "year",
			seconds: 31536e3,
			threshold: Infinity
		}
	];
	const { unit, seconds } = units.find(({ seconds, threshold }) => Math.abs(diffInSeconds / seconds) < threshold) || units[units.length - 1];
	const value = diffInSeconds / seconds;
	return formatter.value.format(Math.round(value), unit);
});
const isInvalidDate = computed(() => Number.isNaN(date.value.getTime()));
const isoDate = computed(() => isInvalidDate.value ? undefined : date.value.toISOString());
const title = computed(() => props.title === true ? isoDate.value : typeof props.title === "string" ? props.title : undefined);
const dataset = {};
if (import.meta.server) {
	for (const prop in props) {
		if (prop !== "datetime") {
			const value = props?.[prop];
			if (value !== undefined && value !== null) {
				const propInKebabCase = prop.split(/(?=[A-Z])/).join("-");
				dataset[`data-${propInKebabCase}`] = props?.[prop];
			}
		}
	}
	onPrehydrate((el) => {
		const now = window._nuxtTimeNow ||= Date.now();
		const toCamelCase = (name, index) => {
			if (index > 0) {
				return name[0].toUpperCase() + name.slice(1);
			}
			return name;
		};
		const datetime = el.getAttribute("datetime");
		if (!datetime) {
			return;
		}
		const date = new Date(datetime);
		if (Number.isNaN(date.getTime())) {
			return;
		}
		const options = {};
		for (const name of el.getAttributeNames()) {
			if (name.startsWith("data-")) {
				let optionName = name.slice(5).split("-").map(toCamelCase).join("");
				if (optionName === "relativeStyle") {
					optionName = "style";
				}
				const attrValue = el.getAttribute(name);
				options[optionName] = attrValue === "true" ? true : attrValue === "false" ? false : attrValue;
			}
		}
		if (options.relative) {
			const diffInSeconds = (date.getTime() - now) / 1e3;
			const units = [
				{
					unit: "second",
					seconds: 1,
					threshold: 60
				},
				{
					unit: "minute",
					seconds: 60,
					threshold: 60
				},
				{
					unit: "hour",
					seconds: 3600,
					threshold: 24
				},
				{
					unit: "day",
					seconds: 86400,
					threshold: 30
				},
				{
					unit: "month",
					seconds: 2592e3,
					threshold: 12
				},
				{
					unit: "year",
					seconds: 31536e3,
					threshold: Infinity
				}
			];
			const { unit, seconds } = units.find(({ seconds, threshold }) => Math.abs(diffInSeconds / seconds) < threshold) || units[units.length - 1];
			const value = diffInSeconds / seconds;
			const formatter = new Intl.RelativeTimeFormat(options.locale, options);
			el.textContent = formatter.format(Math.round(value), unit);
		} else {
			const formatter = new Intl.DateTimeFormat(options.locale, options);
			el.textContent = formatter.format(date);
		}
	});
}
</script>

<template>
  <time
    v-bind="dataset"
    :datetime="isoDate"
    :title="title"
  >{{ formattedDate }}</time>
</template>
