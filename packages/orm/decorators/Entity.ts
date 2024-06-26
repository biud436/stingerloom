/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { ColumnScanner, EntityScanner } from "../scanner";
import { createEntityKey } from "@stingerloom/utils";

export interface EntityOption {
    name?: string;
}

export const ENTITY_TOKEN = Symbol.for("ENTITY");

export function Entity(options?: EntityOption): ClassDecorator {
    return function (target) {
        const scanner = Container.get(EntityScanner);
        const columnScanner = Container.get(ColumnScanner);

        const name = createEntityKey(target.name, scanner);

        const metadata = {
            target,
            columns: columnScanner.allMetadata(),
            options,
            name: target.name,
        };
        scanner.set(name, metadata);

        Reflect.defineMetadata(ENTITY_TOKEN, metadata, target);

        columnScanner.clear();
    };
}
