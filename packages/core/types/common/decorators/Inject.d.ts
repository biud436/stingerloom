import { ClazzType } from "../RouterMapper";
export declare const INJECT_TOKEN: unique symbol;
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
export declare function Inject(token?: string): ParameterDecorator;
