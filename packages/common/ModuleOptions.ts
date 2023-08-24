/* eslint-disable @typescript-eslint/ban-types */
import { DBConnectionOption } from "@stingerloom/factory";
import { ClazzType } from "./RouterMapper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ModuleOptions<T = any> {
    controllers!: ClazzType<T>[];
    providers!: (ClazzType<T> | Function)[];
    configuration!: ReturnType<() => DBConnectionOption>;
}
