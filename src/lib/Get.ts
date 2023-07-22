/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { Metadata, MetadataScanner } from "./MetadataScanner";
import { REQ_TOKEN } from "./Req";
import { HttpRouterParameter } from "./HttpRouterParameter";

export function Get(path = "") {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        // 메소드 함수의 매개변수 정보를 가져옵니다.
        const params =
            (Reflect.getMetadata(
                "design:paramtypes",
                target,
                propertyKey,
            ) as any[]) || [];
        const parameters: HttpRouterParameter[] = [];

        // 매개변수 값을 저장하지만, 매개변수가 Req 객체일 경우에는 특별히 표시합니다.
        params.forEach((param, index) => {
            // Req 데코레이터가 붙은 매개변수의 인덱스를 가져옵니다.
            const reqIndex = Reflect.getMetadata(
                REQ_TOKEN,
                target,
                propertyKey,
            );
            // 매개변수 정보를 저장합니다.
            parameters.push({
                index,
                value: param,
                isReq: reqIndex === index,
            });
        });

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
