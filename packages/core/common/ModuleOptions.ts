/* eslint-disable @typescript-eslint/ban-types */
import { DBConnectionOption } from "@stingerloom/core/factory";
import { ClazzType } from "./RouterMapper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ModuleOptions<T = any> {
    // imports?: Omit<ModuleOptions, "configuration">[];
    imports?: (ClazzType | Omit<ModuleOptions, "configuration">)[];
    controllers!: ClazzType<T>[];
    providers!: (ClazzType<T> | Function)[];
    exports?: (ClazzType<T> | Function)[];
    configuration?: ReturnType<() => DBConnectionOption>;

    static of<T>(options: ModuleOptions): ModuleOptions<T> {
        return Object.assign(new ModuleOptions(), options);
    }

    static merge<T>(
        options: ModuleOptions,
        ...others: Omit<ModuleOptions, "configuration">[]
    ): ModuleOptions<T> {
        return {
            controllers: [
                ...options.controllers,
                ...others.flatMap((o) => o.controllers),
            ],
            providers: [
                ...options.providers,
                ...others.flatMap((o) => o.providers),
            ],
            imports: [
                ...(options.imports || []),
                ...others.flatMap((o) => o.imports || []),
            ],
            exports: [
                ...(options.exports || []),
                ...others.flatMap((o) => o.exports || []),
            ],
            configuration: options.configuration,
        };
    }
}
