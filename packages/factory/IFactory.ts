import { ModuleOptions } from "@stingerloom/common";

export interface IFactory<T> {
    create(options: ModuleOptions["configuration"]): T;
}
