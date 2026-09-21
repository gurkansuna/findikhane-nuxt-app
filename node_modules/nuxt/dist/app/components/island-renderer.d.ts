import { DefineSetupFnComponent } from "vue";
//#region src/app/components/island-renderer.d.ts
interface IslandRendererProps {
  context: {
    name: string;
    props?: Record<string, any>;
  };
}
declare const IslandRenderer: DefineSetupFnComponent<IslandRendererProps>;
//#endregion
export { IslandRenderer as default };