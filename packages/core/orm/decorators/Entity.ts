/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { ColumnScanner, EntityScanner, ManyToOneScanner } from "../scanner";
import { createEntityKey } from "@stingerloom/core/utils";
import { ColumnOption } from "./Column";
import { ClazzType } from "@stingerloom/core/common";
import { ManyToOneMetadata } from "./ManyToOne";

export interface EntityOption {
    name?: string;
}

export const ENTITY_TOKEN = Symbol.for("ENTITY");

export function camelToSnakeCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

export type EntityMetadata<T = any> = {
    target: ClazzType<T>;
    name: string;
    columns: ColumnOption[];
    manyToOnes?: ManyToOneMetadata<unknown>[];
    options?: EntityOption;
};

export function Entity(options?: EntityOption): ClassDecorator {
    return function (target) {
        const scanner = Container.get(EntityScanner);
        const columnScanner = Container.get(ColumnScanner);
        const manyToOneScanner = Container.get(ManyToOneScanner);

        const nameKey = camelToSnakeCase(target.name);
        const name = createEntityKey(nameKey, scanner);

        const metadata = {
            target,
            columns: columnScanner.allMetadata(),
            manyToOnes: manyToOneScanner.allMetadata(),
            options,
            name: nameKey,
        };
        scanner.set(name, metadata);

        Reflect.defineMetadata(ENTITY_TOKEN, metadata, target);

        columnScanner.clear();
    };
}
