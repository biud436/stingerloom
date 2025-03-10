export const TRANSACTIONAL_ZONE = "TRANSACTIONAL_ZONE";
export function TransactionalZone(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (target: any) {
    Reflect.defineMetadata(TRANSACTIONAL_ZONE, true, target);

    return target;
  };
}
