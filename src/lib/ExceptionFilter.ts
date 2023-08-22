import Container from "typedi";
import { ExceptionScanner } from "./ExceptionScanner";
import { DynamicClassWrapper, ExceptionMetadata } from "./MetadataScanner";
import { ErrorMetadataScanner } from "./ErrorMetadataScanner";
import { createUniqueExceptionKey } from "../utils/scanner";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function ExceptionFilter<T extends Error = Error>(
    errorClazz: DynamicClassWrapper<T>,
): ClassDecorator {
    return function (target: any) {
        const scanner = Container.get(ExceptionScanner);
        const metadataScanner = Container.get(ErrorMetadataScanner);

        const name = createUniqueExceptionKey(target.name, scanner);

        scanner.set(name, <ExceptionMetadata>{
            target,
            exception: errorClazz,
            handlers: metadataScanner.allMetadata(),
        });

        metadataScanner.clear();

        return target;
    };
}
