/* eslint-disable @typescript-eslint/no-explicit-any */

import Container from "typedi";
import { ControllerScanner, MetadataScanner } from "./MetadataScanner";

export const CONTROLLER_TOKEN = "CONTROLLER";
export const metadataStorage = {};

export type ClazzType<T> = new (...args: any[]) => T;

export function Controller(path: string): ClassDecorator {
    return function (target: any) {
        const scanner = Container.get(ControllerScanner);
        const metadataScanner = Container.get(MetadataScanner);

        Reflect.defineMetadata(CONTROLLER_TOKEN, target.name, {});

        console.log("Class 스캔 시작");

        const name = target.name;
        scanner.set(name, {
            path,
            target,
            routers: metadataScanner.allMetadata(),
        });

        metadataScanner.clear();

        return target;
    };
}

export function Get(path = "") {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        console.log("Method 스캔 시작");
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
