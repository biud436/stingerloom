/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReflectManager } from "../ReflectManager";
import { ClazzType } from "../RouterMapper";

export const INJECT_TOKEN = Symbol.for("inject");

export function Inject(token: string): ParameterDecorator {
    return (target, _propertyKey, index) => {
        const params = ReflectManager.getParamTypes(target) || [];
        const injectParam = params[index] as ClazzType<any>;

        Reflect.defineMetadata(INJECT_TOKEN, token, injectParam.prototype);
        Reflect.defineMetadata(token, true, injectParam.prototype);
    };
}
