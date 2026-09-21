import { VueLanguagePlugin } from "@vue/language-core";
//#region src/module/named-layout-slots/language.d.ts
interface Config {
  options: {
    dirs: string[];
  };
}
declare const plugin: VueLanguagePlugin<Config>;
export = plugin;