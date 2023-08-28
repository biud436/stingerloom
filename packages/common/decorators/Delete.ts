/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import {
    Metadata,
    MetadataScanner,
} from "@stingerloom/IoC/scanners/MetadataScanner";
import { HttpRouterParameter } from "../HttpRouterParameter";
import { getMethodParameters } from "@stingerloom/utils/extractor";
import { PATH } from "./PATH_KEY";

export function Delete(path = ""): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) {
        const parameters: HttpRouterParameter[] = getMethodParameters(
            target,
            propertyKey as string,
        );

        Reflect.defineMetadata(PATH, path, descriptor.value);

        const scanner = Container.get(MetadataScanner);
        const uniqueKey = scanner.createUniqueKey();
        scanner.set<Metadata>(uniqueKey, {
            path,
            method: "DELETE",
            target,
            router: descriptor.value,
            parameters,
        });
    };
}
