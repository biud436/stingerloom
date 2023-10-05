import Container from "typedi";
import {
    Metadata,
    MetadataScanner,
} from "@stingerloom/IoC/scanners/MetadataScanner";
import { HttpRouterParameter } from "../HttpRouterParameter";
import { getMethodParameters } from "@stingerloom/utils/extractor";
import { PATH } from "./PathToken";

export const GET_KEY = Symbol("GET");
export function Get(path = ""): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) {
        // 메소드 함수의 매개변수 정보를 가져옵니다.
        const parameters: HttpRouterParameter[] = getMethodParameters(
            target,
            propertyKey as string,
        );

        Reflect.defineMetadata(PATH, path, descriptor.value);

        // 메소드 메타데이터를 등록합니다.
        const scanner = Container.get(MetadataScanner);
        const uniqueKey = scanner.createUniqueKey();

        scanner.set<Metadata>(uniqueKey, {
            path,
            method: "GET", // Header 데코레이터의 경우, method를 알 수 없다. 즉, 스캐너는 HTTP Method에 의존성이 있으면 안된다.
            target,
            router: descriptor.value,
            parameters,
        });
    };
}
