export const BEFORE_TRANSACTION_TOKEN = Symbol.for("BEFORE_TRANSACTION_TOKEN");

/**
 * BeforeTransaction Decorator
 *
 * @returns
 */
export function BeforeTransaction(): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) {
        const methodName = propertyKey || descriptor.value.name;

        Reflect.defineMetadata(
            BEFORE_TRANSACTION_TOKEN,
            true,
            target,
            methodName,
        );
    };
}
