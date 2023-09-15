/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReflectManager } from "../ReflectManager";
import { ClazzType } from "../RouterMapper";

export const AUTO_WIRED_TOKEN = Symbol.for("auto_wired");

export interface AutoWiredMetadata {
    target: ClazzType<any>;
    name: string;
    type: any;
}

/**
 * Autowired 데코레이터
 *
 * Autowired 데코레이터는 생성자 의존성 주입이 아니라 생성된 인스턴스의 프로퍼티에 주입합니다.
 *
 * @param token
 * @returns
 */
export function Autowired(): PropertyDecorator {
    return (target, propertyKey) => {
        const injectParam = ReflectManager.getType<any>(target, propertyKey);

        // Create a new inject metadata.
        const metadata = <AutoWiredMetadata>{
            target,
            name: propertyKey,
            type: injectParam,
        };

        const parameters = Reflect.getMetadata(AUTO_WIRED_TOKEN, target);

        Reflect.defineMetadata(
            AUTO_WIRED_TOKEN,
            [...(parameters || []), metadata],
            target,
        );
    };
}
