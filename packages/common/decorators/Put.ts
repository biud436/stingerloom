/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import {
    Metadata,
    MetadataScanner,
} from "@stingerloom/IoC/scanners/MetadataScanner";
import { getMethodParameters } from "@stingerloom/utils/extractor";
import { HttpRouterParameter } from "../HttpRouterParameter";
import { PATH } from "./PathToken";

export function Put(path = ""): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<any>,
    ) {
        const parameters: HttpRouterParameter[] = getMethodParameters(
            target,
            propertyKey as string,
        );

        // PUT 마킹
        Reflect.defineMetadata(PATH, path, descriptor.value);

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
