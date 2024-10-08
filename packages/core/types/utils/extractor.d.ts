import { HttpRouterParameter } from "@stingerloom/core/common/HttpRouterParameter";
/**
 * 특정 메소드의 매개변수 정보를 취득합니다.
 *
 * @param target
 * @param propertyKey
 * @returns
 */
export declare function getMethodParameters(target: any, propertyKey: string): HttpRouterParameter[];
