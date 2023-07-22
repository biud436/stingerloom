/* eslint-disable @typescript-eslint/no-unused-vars */
export const REQ_TOKEN = "req";

export function Req(): ParameterDecorator {
    return (target, propertyKey, index) => {
        const className = target.constructor.name;
        const methodName = propertyKey as string;
        const parameterIndex = index;

        Reflect.defineMetadata(REQ_TOKEN, index, target, methodName);
    };
}
