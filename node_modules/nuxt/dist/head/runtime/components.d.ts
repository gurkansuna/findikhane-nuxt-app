import { CrossOrigin, FetchPriority, HTTPEquiv, LinkRelationship, ReferrerPolicy, Target } from "./types.js";
import { DefineSetupFnComponent, SlotsType, VNode } from "vue";
import { Style as Style$1 } from "@unhead/vue/types";
//#region src/head/runtime/components.d.ts
interface GlobalProps {
  accesskey?: string;
  autocapitalize?: string;
  autofocus?: boolean;
  class?: string | Record<string, any> | Array<any>;
  contenteditable?: boolean;
  contextmenu?: string;
  dir?: string;
  draggable?: boolean;
  enterkeyhint?: string;
  exportparts?: string;
  hidden?: boolean;
  id?: string;
  inputmode?: string;
  is?: string;
  itemid?: string;
  itemprop?: string;
  itemref?: string;
  itemscope?: string;
  itemtype?: string;
  lang?: string;
  nonce?: string;
  part?: string;
  slot?: string;
  spellcheck?: boolean;
  style?: string | Record<string, any> | Array<any>;
  tabindex?: string;
  title?: string;
  translate?: string;
  /**
   * @deprecated Use tagPriority
   */
  renderPriority?: string | number;
  /**
   * Unhead prop to modify the priority of the tag.
   */
  tagPriority?: Style$1['tagPriority'];
}
interface TagPositionPropsType {
  /**
   * @deprecated Use tagPosition
   */
  body?: boolean;
  tagPosition?: Style$1['tagPosition'];
}
type SlotWithDefault = SlotsType<{
  default?: () => VNode[];
}>;
declare const NoScript: DefineSetupFnComponent<GlobalProps & TagPositionPropsType & {
  title?: string;
}, {}, SlotWithDefault>;
interface LinkComponentProps extends GlobalProps, TagPositionPropsType {
  as?: string;
  crossorigin?: CrossOrigin;
  disabled?: boolean;
  fetchpriority?: FetchPriority;
  href?: string;
  hreflang?: string;
  imagesizes?: string;
  imagesrcset?: string;
  integrity?: string;
  media?: string;
  prefetch?: boolean;
  referrerpolicy?: ReferrerPolicy;
  rel?: LinkRelationship;
  sizes?: string;
  title?: string;
  type?: string;
  /** @deprecated **/
  methods?: string;
  /** @deprecated **/
  target?: Target;
}
declare const Link: DefineSetupFnComponent<LinkComponentProps>;
interface BaseComponentProps extends GlobalProps {
  href?: string;
  target?: Target;
}
declare const Base: DefineSetupFnComponent<BaseComponentProps>;
declare const Title: DefineSetupFnComponent<{}, {}, SlotWithDefault>;
interface MetaComponentProps extends GlobalProps {
  charset?: string;
  content?: string;
  httpEquiv?: HTTPEquiv;
  name?: string;
  property?: string;
}
declare const Meta: DefineSetupFnComponent<MetaComponentProps>;
interface StyleComponentProps extends GlobalProps, TagPositionPropsType {
  type?: string;
  media?: string;
  nonce?: string;
  title?: string;
  /** @deprecated **/
  scoped?: boolean;
}
declare const Style: DefineSetupFnComponent<StyleComponentProps, {}, SlotWithDefault>;
declare const Head: DefineSetupFnComponent<{}, {}, SlotWithDefault>;
interface HtmlComponentProps extends GlobalProps {
  manifest?: string;
  version?: string;
  xmlns?: string;
}
declare const Html: DefineSetupFnComponent<HtmlComponentProps, {}, SlotWithDefault>;
declare const Body: DefineSetupFnComponent<GlobalProps, {}, SlotWithDefault>;
//#endregion
export { Base, Body, Head, Html, Link, Meta, NoScript, Style, Title };