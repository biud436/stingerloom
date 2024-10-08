import { ModuleOptions } from "@stingerloom/core/common";
export interface IFactory<T> {
    create(options: ModuleOptions["configuration"]): T;
}
