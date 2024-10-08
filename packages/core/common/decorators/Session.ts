export const SESSION_TOKEN = "session";
export function Session(): ParameterDecorator {
    return (target: object, propertyKey, index) => {
        const methodName = propertyKey as string;

        Reflect.defineMetadata(SESSION_TOKEN, index, target, methodName);
    };
}
