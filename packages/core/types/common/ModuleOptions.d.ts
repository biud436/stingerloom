import { DBConnectionOption } from "@stingerloom/core/factory";
import { ClazzType } from "./RouterMapper";
export declare class ModuleOptions<T = any> {
    imports?: Omit<ModuleOptions, "configuration">[];
    controllers: ClazzType<T>[];
    providers: (ClazzType<T> | Function)[];
    exports?: ClazzType<T>[];
    configuration: ReturnType<() => DBConnectionOption>;
    static of<T>(options: ModuleOptions): ModuleOptions<T>;
    static merge<T>(options: ModuleOptions, ...others: Omit<ModuleOptions, "configuration">[]): ModuleOptions<T>;
}
