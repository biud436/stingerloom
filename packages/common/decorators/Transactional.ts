export const TRANSACTIONAL_TOKEN = "TRANSACTIONAL_TOKEN";
export const TRANSACTION_ISOLATE_LEVEL = "TRANSACTION_ISOLATE_LEVEL";
export const TRANSACTIONAL_PARAMS = "TRANSACTIONAL_PARAMS";

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
        const methodName = descriptor.value.name;
        Reflect.defineMetadata(
            TRANSACTION_ISOLATE_LEVEL,
            option?.isolationLevel ?? DEFAULT_ISOLATION_LEVEL,
            descriptor.value,
        );
        Reflect.defineMetadata(TRANSACTIONAL_TOKEN, true, target, methodName);

        const params = Reflect.getMetadata(
            "design:paramtypes",
            target,
            methodName,
        );
        console.log("매개변수", params);
        Reflect.defineMetadata(
            TRANSACTIONAL_PARAMS,
            params,
            target,
            methodName,
        );
    } as MethodDecorator;
}
