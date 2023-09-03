import { Render } from "./Render";
import { Get } from "./Get";

// Get 데코레이터와 Render 데코레이터를 합친 데코레이터입니다.

export function View(path: string): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor,
    ) {
        Render(path)(target, propertyKey, descriptor);
        Get(path)(target, propertyKey, descriptor);
    };
}
