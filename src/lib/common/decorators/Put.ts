/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { Metadata, MetadataScanner } from "../../IoC/scanners/MetadataScanner";
import { getMethodParameters } from "../../../utils/extractor";
import { HttpRouterParameter } from "../HttpRouterParameter";

export function Put(path = "") {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const parameters: HttpRouterParameter[] = getMethodParameters(
            target,
            propertyKey,
        );

        const scanner = Container.get(MetadataScanner);
        const uniqueKey = scanner.createUniqueKey();
        scanner.set<Metadata>(uniqueKey, {
            path,
            method: "PUT",
            target,
            router: descriptor.value,
            parameters,
        });
    };
}
