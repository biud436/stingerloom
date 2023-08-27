export const TRANSACTIONAL_TOKEN = "TRANSACTIONAL_TOKEN";
export const TRANSACTION_ISOLATE_LEVEL = "TRANSACTION_ISOLATE_LEVEL";
export const TRANSACTIONAL_PARAMS = "TRANSACTIONAL_PARAMS";
export const TRANSACTION_ENTITY_MANAGER = "TRANSACTION_ENTITY_MANAGER";

export interface TransactionalOptions {
    isolationLevel?:
        | "READ UNCOMMITTED"
        | "READ COMMITTED"
        | "REPEATABLE READ"
        | "SERIALIZABLE";
    transactionalEntityManager?: boolean;
}
export const DEFAULT_ISOLATION_LEVEL = "REPEATABLE READ";

export function Transactional(option?: TransactionalOptions) {
    return function (
        target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const methodName = descriptor.value.name;
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
