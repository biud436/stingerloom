/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { ColumnScanner, EntityScanner } from "../scanner";
import { createEntityKey } from "@stingerloom/core/utils";

export interface EntityOption {
    name?: string;
}

export const ENTITY_TOKEN = Symbol.for("ENTITY");

function camelToSnakeCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

export function Entity(options?: EntityOption): ClassDecorator {
    return function (target) {
        const scanner = Container.get(EntityScanner);
        const columnScanner = Container.get(ColumnScanner);

        const nameKey = camelToSnakeCase(target.name);
        const name = createEntityKey(nameKey, scanner);

        const metadata = {
            target,
            columns: columnScanner.allMetadata(),
            options,
            name: nameKey,
        };
        scanner.set(name, metadata);

        Reflect.defineMetadata(ENTITY_TOKEN, metadata, target);

        columnScanner.clear();
    };
}
