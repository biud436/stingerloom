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

        // TODO: Get, Post, Put, Delete, Patch 데코레이터는 가장 먼저 실행되어야 하는데, 이것을 어떻게 구현할 것인가?
        scanner.set<Metadata>(uniqueKey, {
            path,
            method: "GET", // Header 데코레이터의 경우, method를 알 수 없다. 즉, 스캐너는 HTTP Method에 의존성이 있으면 안된다.
            target,
            router: descriptor.value,
            parameters,
        });
    } as MethodDecorator;
}
