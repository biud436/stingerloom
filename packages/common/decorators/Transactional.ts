export const TRANSACTIONAL_TOKEN = "TRANSACTIONAL_TOKEN";
export const TRANSACTION_ISOLATE_LEVEL = "TRANSACTION_ISOLATE_LEVEL";

export interface TransactionalOptions {
    isolationLevel?:
        | "READ UNCOMMITTED"
        | "READ COMMITTED"
        | "REPEATABLE READ"
        | "SERIALIZABLE";
}
export const DEFAULT_ISOLATION_LEVEL = "REPEATABLE READ";

export function Transactional(option?: TransactionalOptions) {
    return function (
        target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        Reflect.defineMetadata(
            TRANSACTION_ISOLATE_LEVEL,
            option?.isolationLevel ?? DEFAULT_ISOLATION_LEVEL,
            descriptor.value,
        );
        Reflect.defineMetadata(TRANSACTIONAL_TOKEN, true, descriptor.value);
    } as MethodDecorator;
}
