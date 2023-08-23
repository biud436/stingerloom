// eslint-disable-next-line @typescript-eslint/ban-types
export type Type = Function | string | symbol | undefined;
/**
 * @class ReflectManager
 * @docs https://rbuckton.github.io/reflect-metadata/
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
    public static getParamType(target: object): Type[] | undefined;
    public static getParamType(
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
}
