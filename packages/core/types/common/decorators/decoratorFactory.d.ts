import { ServerContext } from "./UseGuard";
export type HttpParamDecoratorCallback<T = any> = (data: T, context: ServerContext) => any;
export declare const HTTP_PARAM_DECORATOR_TOKEN = "HTTP_PARAM_DECORATOR_TOKEN";
export interface CustomParamDecoratorMetadata {
    [key: string]: {
        callback: HttpParamDecoratorCallback;
        index: number;
    };
}
/**
 * 커스텀 파라미터 옵션을 취득하기 위한 키를 생성합니다.
 *
 * @param target
 * @param propertyKey
 * @param index
 * @returns
 */
export declare function getParamDecoratorUniqueKey(target: any, propertyKey: string, index: number): string;
/**
 * 커스텀 파라미터 데코레이터에 필요한 옵션을 병합합니다.
 *
 * @param previous
 * @param target
 * @param propertyKey
 * @param index
 * @param callback
 * @returns
 */
export declare function mergeCustomParamDecoractor(previous: CustomParamDecoratorMetadata, target: object, propertyKey: string | symbol | undefined, index: number, callback: HttpParamDecoratorCallback): {
    [x: string]: {
        callback: HttpParamDecoratorCallback<any>;
        index: number;
    } | {
        callback: HttpParamDecoratorCallback<any>;
        index: number;
    };
};
/**
 * 커스텀 파라미터 데코레이터를 생성합니다.
 *
 * @param callback
 * @returns
 */
export declare function createCustomParamDecorator(callback: HttpParamDecoratorCallback): (...args: any[]) => ParameterDecorator;
