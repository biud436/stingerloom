import { INJECTABLE_TOKEN } from "./decorators/Injectable";

// eslint-disable-next-line @typescript-eslint/ban-types
export type Type = Function | string | symbol | undefined;
/**
 * @class ReflectManager
 * @docs https://rbuckton.github.io/reflect-metadata/
 * @description
 * design: 접두사를 사용하면 타입스크립트 컴파일러가 타입 정보를 보존하기 때문에 타입 정보를 추출할 수 있습니다.
 */
export class ReflectManager {
    /**
     * 타입을 반환합니다.
     *
     * @param target
     * @param key [optional]
     */
    public static getType(target: object): Type | undefined;
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
     * @param key [optional]
     */
    public static getParamTypes(target: object): Type[] | undefined;
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
     * @param key [optional]
     */
    public static getReturnType(target: object): Type | undefined;
    public static getReturnType(
        target: object,
        key?: string | symbol | undefined,
    ) {
        if (key) return Reflect.getMetadata("design:returntype", target, key!);
        return Reflect.getMetadata("design:returntype", target);
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
