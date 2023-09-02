export const TRANSACTIONAL_TOKEN = "TRANSACTIONAL_TOKEN";
export const TRANSACTION_ISOLATE_LEVEL = "TRANSACTION_ISOLATE_LEVEL";
export const TRANSACTION_PROPAGATION = "TRANSACTION_PROPAGATION";
export const TRANSACTIONAL_PARAMS = "TRANSACTIONAL_PARAMS";
export const TRANSACTION_ENTITY_MANAGER = "TRANSACTION_ENTITY_MANAGER";

export enum TransactionIsolationLevel {
    READ_UNCOMMITTED = "READ UNCOMMITTED",
    READ_COMMITTED = "READ COMMITTED",
    REPEATABLE_READ = "REPEATABLE READ",
    SERIALIZABLE = "SERIALIZABLE",
}

export enum TransactionPropagation {
    REQUIRES_NEW = "REQUIRES_NEW",
}

export interface TransactionalOptions {
    isolationLevel?: TransactionIsolationLevel;
    transactionalEntityManager?: boolean;
    propagation?: TransactionPropagation;
}
export const DEFAULT_ISOLATION_LEVEL =
    TransactionIsolationLevel.REPEATABLE_READ;

export function Transactional(option?: TransactionalOptions): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) {
        const methodName = propertyKey || descriptor.value.name;
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
        Reflect.defineMetadata(
            TRANSACTION_ENTITY_MANAGER,
            option?.propagation ?? TransactionPropagation.REQUIRES_NEW,
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
