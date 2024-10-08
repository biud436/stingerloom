import { Exception } from "@stingerloom/core/error/Exception";
export declare const TRANSACTIONAL_TOKEN = "TRANSACTIONAL_TOKEN";
export declare const TRANSACTION_ISOLATE_LEVEL = "TRANSACTION_ISOLATE_LEVEL";
export declare const TRANSACTION_PROPAGATION = "TRANSACTION_PROPAGATION";
export declare const TRANSACTIONAL_PARAMS = "TRANSACTIONAL_PARAMS";
export declare const TRANSACTION_ENTITY_MANAGER = "TRANSACTION_ENTITY_MANAGER";
export declare const TRANSACTION_LAZY_ROLLBACK = "TRANSACTION_LAZY_ROLLBACK";
export declare enum TransactionIsolationLevel {
    READ_UNCOMMITTED = "READ UNCOMMITTED",
    READ_COMMITTED = "READ COMMITTED",
    REPEATABLE_READ = "REPEATABLE READ",
    SERIALIZABLE = "SERIALIZABLE"
}
export declare enum TransactionPropagation {
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
    NESTED = "NESTED"
}
export type TransactionalRollbackException = (e?: any) => Exception;
export interface TransactionalOptions {
    isolationLevel?: TransactionIsolationLevel;
    transactionalEntityManager?: boolean;
    propagation?: TransactionPropagation;
    rollback?: TransactionalRollbackException;
}
export declare const DEFAULT_ISOLATION_LEVEL = TransactionIsolationLevel.REPEATABLE_READ;
export declare function Transactional(option?: TransactionalOptions): MethodDecorator;
