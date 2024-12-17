import "reflect-metadata";
import { ModuleOptions } from "./ModuleOptions";

export const MODULE_TOKEN = "MODULE_TOKEN";
export const MODULE_OPTIONS_TOKEN = "MODULE_OPTIONS_TOKEN";
export type DynamicModuleOption = Omit<ModuleOptions, "configuration">;

export function Module(options: DynamicModuleOption): ClassDecorator {
    return (target: object) => {
        Reflect.defineMetadata(MODULE_TOKEN, true, target);
        Reflect.defineMetadata(MODULE_OPTIONS_TOKEN, options, target);
    };
}
