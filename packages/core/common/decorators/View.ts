/* eslint-disable @typescript-eslint/no-explicit-any */
import { Render } from "./Render";
import { Get } from "./Get";

// Get 데코레이터와 Render 데코레이터를 합친 데코레이터입니다.

export function View(path: string): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) {
    if (path.includes(":")) {
      console.warn("View 데코레이터에는 파라미터를 넣을 수 없습니다.");
      Get(path)(target, propertyKey, descriptor);
      return;
    }

    Render(path)(target, propertyKey, descriptor);
    Get(path)(target, propertyKey, descriptor);
  };
}
