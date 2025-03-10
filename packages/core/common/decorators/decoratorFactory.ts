/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServerContext } from "./UseGuard";

export type HttpParamDecoratorCallback<T = any> = (
  data: T,
  context: ServerContext,
) => any;

export const HTTP_PARAM_DECORATOR_TOKEN = "HTTP_PARAM_DECORATOR_TOKEN";
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
export function getParamDecoratorUniqueKey(
  target: any,
  propertyKey: string,
  index: number,
): string {
  return `${target.constructor.name}.${propertyKey}#${index}`;
}

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
export function mergeCustomParamDecoractor(
  previous: CustomParamDecoratorMetadata,
  target: object,
  propertyKey: string | symbol | undefined,
  index: number,
  callback: HttpParamDecoratorCallback,
) {
  const uniqueKey = getParamDecoratorUniqueKey(
    target,
    propertyKey as string,
    index,
  );

  return {
    ...previous,
    [uniqueKey]: {
      callback,
      index,
    },
  };
}

/**
 * 커스텀 파라미터 데코레이터를 생성합니다.
 *
 * @param callback
 * @returns
 */
export function createCustomParamDecorator(
  callback: HttpParamDecoratorCallback,
): (...args: any[]) => ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (...args: any[]): ParameterDecorator =>
    (target, propertyKey, index) => {
      const previousCallback = Reflect.getMetadata(
        HTTP_PARAM_DECORATOR_TOKEN,
        target,
        propertyKey as string,
      ) as CustomParamDecoratorMetadata;

      // 키가 중복되지 않도록 해야 합니다.
      const uniqueKey = getParamDecoratorUniqueKey(
        target,
        propertyKey as string,
        index,
      );

      // 매개변수 인덱스를 읽는 기능이 없기 때문에 기존의 메타데이터와 병합해야 합니다.
      Reflect.defineMetadata(
        HTTP_PARAM_DECORATOR_TOKEN,
        {
          ...mergeCustomParamDecoractor(
            previousCallback,
            target,
            propertyKey,
            index,
            callback,
          ),
        },
        target,
        propertyKey as string,
      );
    };
}
