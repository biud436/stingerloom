/* eslint-disable @typescript-eslint/no-explicit-any */
export const HEADER_TOKEN = "HEADER_TOKEN";
export interface HeaderMetadata {
    key: string;
    value: string;
}
export function Header(key: string, value: string): MethodDecorator {
    return function (
        target: object,
        methodName: string | symbol,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        descriptor: TypedPropertyDescriptor<any>,
    ) {
        const parameters = Reflect.getMetadata(
            HEADER_TOKEN,
            target,
            methodName as string,
        );

        Reflect.defineMetadata(
            HEADER_TOKEN,
            [
                ...(parameters || []),
                {
                    key,
                    value,
                },
            ],
            target,
            methodName as string,
        );
    };
}
