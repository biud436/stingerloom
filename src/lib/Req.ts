/* eslint-disable @typescript-eslint/no-unused-vars */
export const REQ_TOKEN = "req";

export function Req(): ParameterDecorator {
    return (target, propertyKey, index) => {
        // const params = Reflect.getMetadata("design:paramtypes", target);
        // const injectParam = params[index];

        const className = target.constructor.name;
        const methodName = propertyKey as string;
        const parameterIndex = index;

        // 몇번째 매개변수 인지 마킹
        Reflect.defineMetadata(REQ_TOKEN, index, target, methodName);
    };
}
