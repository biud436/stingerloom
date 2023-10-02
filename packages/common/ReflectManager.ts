/* eslint-disable @typescript-eslint/no-explicit-any */
import { CONTROLLER_TOKEN } from "./RouterMapper";
import {
    AFTER_TRANSACTION_TOKEN,
    BEFORE_TRANSACTION_TOKEN,
    REPOSITORY_ENTITY_METADATA,
    RepositoryMetadataItem,
    TRANSACTIONAL_TOKEN,
    TRANSACTIONAL_ZONE,
    TRANSACTION_COMMIT_TOKEN,
    TRANSACTION_ROLLBACK_TOKEN,
    USE_GUARD_OPTION_TOKEN,
} from "./decorators";

import { INJECTABLE_TOKEN } from "./decorators/Injectable";

// eslint-disable-next-line @typescript-eslint/ban-types
export type Type = Function | string | symbol | undefined;
/**
 * @class ReflectManager
 * @docs https://rbuckton.github.io/reflect-metadata/
 * @description
 * 이 클래스는 데코레이터를 통해 수집한 메타데이터를 관리하기 위해 만든 유틸리티 클래스입니다.
 * 메타 데이터는 파일 단위로 순서대로 읽어가면서 수집이 되기 때문에 동작 순서를 보장해야 하는 경우에는
 * 메타데이터 수집 완료 이후, 서버 시작 단계에서 수집된 메타데이터를 읽고 수집된 메타데이터를 바탕으로 필요한 데이터를 만들어냅니다.
 *
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
     * @param key
     */
    public static getType<T = Type>(target: object): T | undefined;
    public static getType<T = Type>(
        target: object,
        key?: string | symbol | undefined,
    ): T | undefined;
    public static getType<T = Type>(
        target: object,
        key?: string | symbol | undefined,
    ): T | undefined {
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
        if (!Object.getPrototypeOf(target)) {
            return false;
        }
        return Reflect.getMetadata(INJECTABLE_TOKEN, target) !== undefined;
    }

    /**
     * 가드가 걸려있는지 여부를 반환합니다.
     *
     * @param target
     * @returns
     */
    public static isGuard(target: object, propertyKey?: string): boolean {
        if (!Object.getPrototypeOf(target)) {
            return false;
        }
        if (!this.isInjectable(target)) {
            return false;
        }

        // 메소드인가?
        if (propertyKey) {
            return (
                Reflect.getMetadata(
                    USE_GUARD_OPTION_TOKEN,
                    target,
                    propertyKey,
                ) !== undefined
            );
        } else {
            // 컨트롤러(클래스)인가?
            return (
                Reflect.getMetadata(USE_GUARD_OPTION_TOKEN, target) !==
                undefined
            );
        }
    }

    /**
     * 트랜잭션 존재 여부를 반환합니다.
     * @param target
     * @returns
     */
    public static isTransactionalZone(target: object): boolean {
        if (!Object.getPrototypeOf(target)) {
            return false;
        }
        return Reflect.getMetadata(TRANSACTIONAL_ZONE, target) !== undefined;
    }

    /**
     * BeforeTransaction 메서드 여부를 반환합니다.
     *
     * @param target
     * @param key
     * @returns
     */
    public static isBeforeTransactionMethod(target: object, key: string) {
        return (
            Reflect.getMetadata(BEFORE_TRANSACTION_TOKEN, target, key) !==
            undefined
        );
    }

    /**
     * AfterTransaction 메서드 여부를 반환합니다.
     *
     * @param target
     * @param key
     * @returns
     */
    public static isAfterTransactionMethod(target: object, key: string) {
        return (
            Reflect.getMetadata(AFTER_TRANSACTION_TOKEN, target, key) !==
            undefined
        );
    }

    /**
     * 커밋 메서드 여부를 반환합니다.
     *
     * @param target
     * @param key
     * @returns
     */
    public static isCommitMethod(target: object, key: string) {
        return (
            Reflect.getMetadata(TRANSACTION_COMMIT_TOKEN, target, key) !==
            undefined
        );
    }

    /**
     * 롤백 메서드 여부를 반환합니다.
     *
     * @param target
     * @param key
     * @returns
     */
    public static isRollbackMethod(target: object, key: string) {
        return (
            Reflect.getMetadata(TRANSACTION_ROLLBACK_TOKEN, target, key) !==
            undefined
        );
    }

    /**
     * 트랜잭션 메서드 여부를 반환합니다.
     *
     * @param target
     * @param key
     * @returns
     */
    public static isTransactionalZoneMethod(target: object, key: string) {
        return (
            Reflect.getMetadata(TRANSACTIONAL_TOKEN, target, key) !== undefined
        );
    }

    /**
     * Repository인지 여부를 반환합니다.
     *
     * @param target
     * @returns
     */
    public static isRepository(target: any): boolean {
        // if (!Object.getPrototypeOf(target)) return false;
        return (
            Reflect.getMetadata(REPOSITORY_ENTITY_METADATA, target) !==
            undefined
        );
    }

    /**
     * Entity를 반환합니다.
     * @param target
     * @returns
     */
    public static getRepositoryEntity(
        target: any,
        injector?: any,
        index?: number,
    ): any {
        const store =
            Reflect.getMetadata(REPOSITORY_ENTITY_METADATA, target) ?? [];

        const targets = store.filter((item: RepositoryMetadataItem) => {
            console.log("item.target", item.target);
            console.log("injector", injector);
            console.log("item.target === injector", item.target === injector);
            console.log("item.index === index", item.index === index);

            console.log("item.index", item.index);
            console.log("index", index);

            return item.target === injector && item.index === index;
        });
        const repository = targets[0] as any;

        console.log("repository:", repository);

        if (!repository) {
            return undefined;
        }

        return repository.entity;
    }
}
