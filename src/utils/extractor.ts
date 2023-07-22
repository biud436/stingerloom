/* eslint-disable @typescript-eslint/no-explicit-any */
import { REQ_TOKEN } from "../lib/Req";
import { HttpRouterParameter } from "../lib/HttpRouterParameter";
import { BODY_TOKEN, BodyParameter } from "../lib/Body";

/**
 * 특정 메소드의 매개변수 정보를 취득합니다.
 *
 * @param target
 * @param propertyKey
 * @returns
 */
export function getMethodParameters(target: any, propertyKey: string) {
    const params =
        (Reflect.getMetadata(
            "design:paramtypes",
            target,
            propertyKey,
        ) as any[]) || [];
    const parameters: HttpRouterParameter[] = [];
    // const className = target.constructor.name;
    // const methodName = propertyKey as string;

    // 매개변수 값을 저장하지만, 매개변수가 Req 객체일 경우에는 특별히 표시합니다.
    params.forEach((param, index) => {
        // Req 데코레이터가 붙은 매개변수의 인덱스를 가져옵니다.
        const reqIndex = Reflect.getMetadata(REQ_TOKEN, target, propertyKey);
        // Body 데코레이터가 붙은 매개변수의 인덱스를 가져옵니다.
        const bodyParam = Reflect.getMetadata(
            BODY_TOKEN,
            target,
            propertyKey,
        ) as BodyParameter;

        parameters.push({
            index,
            value: param,
            isReq: reqIndex === index,
            body: bodyParam,
            // isBody: bodyParam.index === index,
            // body: bodyParam.type,
        });
    });
    return parameters;
}
