/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { ErrorAdvice, ErrorMetadata } from "./MetadataScanner";
import { ErrorMetadataScanner } from "./ErrorMetadataScanner";

export function Catch(advice: ErrorAdvice = "throwing") {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const scanner = Container.get(ErrorMetadataScanner);
        const uniqueKey = scanner.createUniqueKey();

        scanner.set(uniqueKey, <ErrorMetadata>{
            target,
            handler: descriptor.value,
            advice,
        });
    } as MethodDecorator;
}
