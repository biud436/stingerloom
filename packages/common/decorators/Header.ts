export const HEADER_TOKEN = "HEADER_TOKEN";
export function Header(key: string, value: string): MethodDecorator {
    return function (
        target: object,
        methodName: string | symbol,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        descriptor: PropertyDescriptor,
    ) {
        Reflect.defineMetadata(
            HEADER_TOKEN,
            {
                key,
                value,
            },
            target,
            methodName as string,
        );
    };
}
