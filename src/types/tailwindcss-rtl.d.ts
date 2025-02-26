import { PluginCreator } from "tailwindcss/types/config";

declare module "tailwindcss-rtl" {
  const plugin: PluginCreator;
  export default plugin;
}
