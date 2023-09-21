export const TRANSACTION_ROLLBACK_TOKEN = Symbol.for("ROLLBACK_TOKEN");

/**
 * Rollback ecorator
 *
 * @returns
 */
export function Rollback(): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) {
        const methodName = propertyKey || descriptor.value.name;

        Reflect.defineMetadata(
            TRANSACTION_ROLLBACK_TOKEN,
            true,
            target,
            methodName,
        );
    } as MethodDecorator;
}
