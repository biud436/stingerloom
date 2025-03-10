export const AFTER_TRANSACTION_TOKEN = Symbol.for("AFTER_TRANSACTION_TOKEN");

/**
 * AfterTransaction Decorator
 *
 * @returns {MethodDecorator}
 */
export function AfterTransaction(): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const methodName = propertyKey || descriptor.value.name;

    Reflect.defineMetadata(AFTER_TRANSACTION_TOKEN, true, target, methodName);
  };
}
