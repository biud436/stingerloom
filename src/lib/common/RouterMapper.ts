/* eslint-disable @typescript-eslint/no-explicit-any */

import Container from "typedi";
import { ControllerScanner, MetadataScanner } from "./MetadataScanner";

export const CONTROLLER_TOKEN = "CONTROLLER";
export const metadataStorage = {};

export type ClazzType<T> = new (...args: any[]) => T;

export function Controller(path: string): ClassDecorator {
    return function (target: any) {
        const scanner = Container.get(ControllerScanner);
        const TOKEN = `${path}`;

        Reflect.set(scanner, TOKEN, target);
        Reflect.defineMetadata(CONTROLLER_TOKEN, TOKEN, target);

        const name = target.name;
        scanner.set(name, {
            path,
            method: "GET",
            target,
            router: target,
        });

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
