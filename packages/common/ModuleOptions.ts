/* eslint-disable @typescript-eslint/ban-types */
import { DBConnectionOption } from "@stingerloom/factory";
import { ClazzType } from "./RouterMapper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ModuleOptions<T = any> {
    imports?: Omit<ModuleOptions, "configuration">[];
    controllers!: ClazzType<T>[];
    providers!: (ClazzType<T> | Function)[];
    exports?: ClazzType<T>[];
    configuration!: ReturnType<() => DBConnectionOption>;

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
            configuration: options.configuration,
        };
    }
}
