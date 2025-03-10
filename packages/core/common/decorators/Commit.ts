/* eslint-disable @typescript-eslint/no-explicit-any */
export const TRANSACTION_COMMIT_TOKEN = Symbol.for("TRANSACTION_COMMIT_TOKEN");

/**
 * Commit Decorator
 *
 * @returns {MethodDecorator}
 */
export function Commit(): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) {
    const methodName = propertyKey || descriptor.value.name;

    Reflect.defineMetadata(TRANSACTION_COMMIT_TOKEN, true, target, methodName);
  } as MethodDecorator;
}
