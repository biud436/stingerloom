/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReflectManager } from "../ReflectManager";
import { ClazzType } from "../RouterMapper";

export const INJECT_TOKEN = Symbol.for("inject");
export interface InjectMetadata {
    token?: string;
    target: ClazzType<any>;
    prototype: any;
}

/**
 * Inject 데코레이터
 * 이 데코레이터는 생성자 의존성 주입이 아니라 생성된 인스턴스의 프로퍼티에 주입합니다.
 *
 * @param token
 * @returns
 */
export function Inject(token?: string): ParameterDecorator {
    return (target, _propertyKey, index) => {
        const params = ReflectManager.getParamTypes(target) || [];
        const injectParam = params[index] as ClazzType<any>;

        // Create a new inject metadata.
        const metadata = <InjectMetadata>{
            token,
            target,
            prototype: injectParam.prototype,
        };

        Reflect.defineMetadata(INJECT_TOKEN, metadata, injectParam.prototype);

        if (token) {
            Reflect.defineMetadata(token, metadata, injectParam.prototype);
        }
    };
}
