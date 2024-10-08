import { Exception } from "@stingerloom/core/error/Exception";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const TRANSACTIONAL_TOKEN = "TRANSACTIONAL_TOKEN";
export const TRANSACTION_ISOLATE_LEVEL = "TRANSACTION_ISOLATE_LEVEL";
export const TRANSACTION_PROPAGATION = "TRANSACTION_PROPAGATION";
export const TRANSACTIONAL_PARAMS = "TRANSACTIONAL_PARAMS";
export const TRANSACTION_ENTITY_MANAGER = "TRANSACTION_ENTITY_MANAGER";
export const TRANSACTION_LAZY_ROLLBACK = "TRANSACTION_LAZY_ROLLBACK";

export enum TransactionIsolationLevel {
    READ_UNCOMMITTED = "READ UNCOMMITTED",
    READ_COMMITTED = "READ COMMITTED",
    REPEATABLE_READ = "REPEATABLE READ",
    SERIALIZABLE = "SERIALIZABLE",
}

export enum TransactionPropagation {
    /**
     * 기존 트랜잭션에 참여하고 없으면 새로운 트랜잭션을 생성한다.
     */
    REQUIRED = "REQUIRED",
    /**
     * 트랜잭션 컨텍스트에서 기존 컨텍스트와 다른 트랜잭션이 호출될 때,
     * 기존 트랜잭션을 일시 중단하고 새로운 트랜잭션을 생성합니다.
     * 기존 컨텍스트에 트랜잭션이 없으면 새로 생성합니다.
     *
     * 이 전파 속성에서는 queryRunner가 공유되지 않습니다.
     * queryRunner.connect()를 통해 새로운 커넥션을 생성합니다.
     */
    REQUIRES_NEW = "REQUIRES_NEW",

    /**
     * 중첩된 트랜잭션을 생성합니다.
     * 동일한 매니저로 트랜잭션을 진행합니다.
     */
    NESTED = "NESTED",
}

export type TransactionalRollbackException = (e?: any) => Exception;

export interface TransactionalOptions {
    isolationLevel?: TransactionIsolationLevel;
    transactionalEntityManager?: boolean;
    propagation?: TransactionPropagation;
    rollback?: TransactionalRollbackException;
}
export const DEFAULT_ISOLATION_LEVEL =
    TransactionIsolationLevel.REPEATABLE_READ;

export function Transactional(option?: TransactionalOptions): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<any>,
    ) {
        const methodName = propertyKey || descriptor.value.name;

        // 트랜잭션 격리 수준
        Reflect.defineMetadata(
            TRANSACTION_ISOLATE_LEVEL,
            option?.isolationLevel ?? DEFAULT_ISOLATION_LEVEL,
            target,
            methodName,
        );
        Reflect.defineMetadata(
            TRANSACTION_ENTITY_MANAGER,
            option?.transactionalEntityManager ?? false,
            target,
            methodName,
        );

        // 트랜잭션 전파 속성
        Reflect.defineMetadata(
            TRANSACTION_PROPAGATION,
            option?.propagation ?? TransactionPropagation.REQUIRED,
            target,
            methodName,
        );

        // 트랜잭션 롤백 Exception
        Reflect.defineMetadata(
            TRANSACTION_LAZY_ROLLBACK,
            option?.rollback ?? null,
            target,
            methodName,
        );

        Reflect.defineMetadata(TRANSACTIONAL_TOKEN, true, target, methodName);

        const params = Reflect.getMetadata(
            "design:paramtypes",
            target,
            methodName,
        );

        Reflect.defineMetadata(
            TRANSACTIONAL_PARAMS,
            params,
            target,
            methodName,
        );
    } as MethodDecorator;
}
