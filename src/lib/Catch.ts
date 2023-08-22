/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { ErrorMetadata } from "./MetadataScanner";
import { ErrorMetadataScanner } from "./ErrorMetadataScanner";

export function Catch() {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const scanner = Container.get(ErrorMetadataScanner);
        const uniqueKey = scanner.createUniqueKey();

        // Catch에서는 메소드 함수의 매개변수 정보는 처리하지 않습니다.

        scanner.set(uniqueKey, <ErrorMetadata>{
            target,
            handler: descriptor.value,
        });
    } as MethodDecorator;
}
