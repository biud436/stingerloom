import { ModuleOptions } from "./ModuleOptions";
export declare const MODULE_TOKEN = "MODULE_TOKEN";
export declare const MODULE_OPTIONS_TOKEN = "MODULE_OPTIONS_TOKEN";
export type DynamicModuleOption = Omit<ModuleOptions, "configuration">;
export declare function Module(options: DynamicModuleOption): ClassDecorator;
