/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { Metadata, MetadataScanner } from "./MetadataScanner";
import { HttpRouterParameter } from "./HttpRouterParameter";
import { getMethodParameters } from "../utils/extractor";

export function Get(path = "") {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        // 메소드 함수의 매개변수 정보를 가져옵니다.
        const parameters: HttpRouterParameter[] = getMethodParameters(
            target,
            propertyKey,
        );

        // 메소드 메타데이터를 등록합니다.
        const scanner = Container.get(MetadataScanner);
        const uniqueKey = scanner.createUniqueKey();
        scanner.set<Metadata>(uniqueKey, {
            path,
            method: "GET",
            target,
            router: descriptor.value,
            parameters,
        });
    } as MethodDecorator;
}
