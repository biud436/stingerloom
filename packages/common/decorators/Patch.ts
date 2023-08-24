import Container from "typedi";
import { Metadata, MetadataScanner } from "../../IoC/scanners/MetadataScanner";
import { getMethodParameters } from "../../utils/extractor";
import { HttpRouterParameter } from "../HttpRouterParameter";
import { PATH } from "./PATH_KEY";

export const PATCH_KEY = Symbol("PATCH");

export function Patch(path = "") {
    return function (
        target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const parameters: HttpRouterParameter[] = getMethodParameters(
            target,
            propertyKey,
        );

        Reflect.defineMetadata(PATH, path, descriptor.value);

        const scanner = Container.get(MetadataScanner);
        const uniqueKey = scanner.createUniqueKey();
        scanner.set<Metadata>(uniqueKey, {
            path,
            method: "PATCH",
            target,
            router: descriptor.value,
            parameters,
        });
    };
}
