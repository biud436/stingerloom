/* eslint-disable @typescript-eslint/no-explicit-any */
export const TRANSACTION_CONTEXT_TOKEN = "TRANSACTION_CONTEXT_TOKEN";

export function TransactionContext(): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    Reflect.defineMetadata(TRANSACTION_CONTEXT_TOKEN, true, descriptor.value);
  };
}
