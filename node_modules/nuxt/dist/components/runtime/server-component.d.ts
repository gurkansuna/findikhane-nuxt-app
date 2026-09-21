import { DefineSetupFnComponent } from "vue";
//#region src/components/runtime/server-component.d.ts
interface ServerComponentProps {
  lazy?: boolean;
}
type ServerComponentEmits = {
  error: (error: unknown) => void;
};
type ServerComponentType = DefineSetupFnComponent<ServerComponentProps, ServerComponentEmits>;
type IslandPageType = DefineSetupFnComponent<ServerComponentProps>;
declare const createServerComponent: (name: string) => ServerComponentType;
declare const createIslandPage: (name: string, islandKey?: string) => IslandPageType;
//#endregion
export { createIslandPage, createServerComponent };