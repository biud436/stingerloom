/* eslint-disable @typescript-eslint/no-explicit-any */

import Container from "typedi";
import { MetadataScanner } from "./MetadataScanner";

export const CONTROLLER_TOKEN = "CONTROLLER";
export const metadataStorage = {};

export function Controller(path: string): ClassDecorator {
    return function (target: any) {
        const scanner = Container.get(MetadataScanner);
        const TOKEN = `${path}`;

        Reflect.set(scanner, TOKEN, target);
        Reflect.defineMetadata(CONTROLLER_TOKEN, TOKEN, target);

        return target;
    };
}

export function Get(path: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const scanner = Container.get(MetadataScanner);

        const uniqueKey = scanner.createUniqueKey();
        scanner.set(uniqueKey, {
            path,
            method: "GET",
            target,
            router: descriptor.value,
        });
    };
}
