/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONTROLLER_TOKEN } from "./RouterMapper";

import { INJECTABLE_TOKEN } from "./decorators/Injectable";

// eslint-disable-next-line @typescript-eslint/ban-types
export type Type = Function | string | symbol | undefined;
/**
 * @class ReflectManager
 * @docs https://rbuckton.github.io/reflect-metadata/
 * @description
 * design: 접두사를 사용하면 타입스크립트 컴파일러가 타입 정보를 보존하기 때문에 타입 정보를 추출할 수 있습니다.
 *
 * https://github.com/microsoft/TypeScript/blob/d0684f789b6e8368789c0f9e09f5b5217f59de2b/src/compiler/transformers/ts.ts#L1139
 * https://github.com/microsoft/TypeScript/blob/d0684f789b6e8368789c0f9e09f5b5217f59de2b/src/compiler/transformers/ts.ts#L1071
 *
 * 링크는 타입스크립트 컴파일러의 소스 코드이며 design:* 키를 사용하면 타입 정보를 특별히 보존하는 것을 확인할 수 있습니다.
 */
export class ReflectManager {
    /**
     * 타입을 반환합니다.
     *
     * @param target
     */
    public static getType(target: object): Type | undefined;

    /**
     * 타입을 반환합니다.
     *
     * @param target
     * @param key
     */
    public static getType(
        target: object,
        key?: string | symbol | undefined,
    ): Type | undefined {
        if (key) return Reflect.getMetadata("design:type", target, key!);
        return Reflect.getMetadata("design:type", target);
    }

    /**
     * 매개변수의 타입을 반환합니다.
     *
     * @param target
     */
    public static getParamTypes(target: object): Type[] | undefined;

    /**
     * 매개변수의 타입을 반환합니다.
     *
     * @param target
     * @param key
     */
    public static getParamTypes(
        target: object,
        key: string | symbol | undefined,
    ): Type[] | undefined;
    public static getParamTypes(
        target: object,
        key?: string | symbol | undefined,
    ) {
        if (key) return Reflect.getMetadata("design:paramtypes", target, key!);
        return Reflect.getMetadata("design:paramtypes", target);
    }

    /**
     * 반환 값의 타입을 반환합니다.
     *
     * @param target
     * @param
     */
    public static getReturnType(target: object): Type | undefined;

    /**
     * 반환 값의 타입을 반환합니다.
     *
     * @param target
     * @param key
     */
    public static getReturnType(
        target: object,
        key?: string | symbol | undefined,
    ) {
        if (key) return Reflect.getMetadata("design:returntype", target, key!);
        return Reflect.getMetadata("design:returntype", target);
    }

    /**
     * 타입 정보를 반환합니다.
     *
     * @param target
     */
    public static getTypeInfo(target: object): any;

    /**
     * 타입 정보를 반환합니다.
     *
     * @param target
     * @param key
     */
    public static getTypeInfo(
        target: object,
        key: string | symbol | undefined,
    ): any;

    public static getTypeInfo(
        target: object,
        key?: string | symbol | undefined,
    ) {
        if (key) return Reflect.getMetadata("design:typeinfo", target, key);
        return Reflect.getMetadata("design:typeinfo", target);
    }

    /**
     * 컨트롤러인지 여부를 반환합니다.
     */
    public static isController(target: object): boolean {
        return Reflect.getMetadata(CONTROLLER_TOKEN, target) !== undefined;
    }

    /**
     * 주입 가능한지 여부를 반환합니다.
     *
     * @param target
     * @returns
     */
    public static isInjectable(target: object): boolean {
        return Reflect.getMetadata(INJECTABLE_TOKEN, target) !== undefined;
    }
}
