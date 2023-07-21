/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { Metadata, MetadataScanner } from "./MetadataScanner";

export function Patch(path = "") {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const scanner = Container.get(MetadataScanner);
        const uniqueKey = scanner.createUniqueKey();
        scanner.set<Metadata>(uniqueKey, {
            path,
            method: "PATCH",
            target,
            router: descriptor.value,
        });
    };
}
