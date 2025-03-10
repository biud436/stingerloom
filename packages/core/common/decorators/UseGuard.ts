/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType } from "../RouterMapper";
import { HttpRequest, HttpResponse } from "../http/interfaces";
export class ServerContext {
  req!: HttpRequest;
  res!: HttpResponse;
  type?: () => ClazzType<any>;

  constructor(
    req: HttpRequest,
    res?: HttpResponse,
    type?: () => ClazzType<any>,
  ) {
    this.req = req;

    if (res) {
      this.res = res;
    }

    if (type) {
      this.type = type;
    }
  }
}

export interface Guard {
  /**
   * canActivate 메소드는 요청을 처리하기 전에 실행됩니다.
   *
   * @param context
   */
  canActivate(context: ServerContext): Promise<boolean> | boolean;
}

export const USE_GUARD_OPTION_TOKEN = "USE_GUARD_CLASS_TOKEN";

// Method Decorator 와 Class Decorator에서 동시 사용 가능
export function UseGuard<T extends Guard = Guard>(
  ...guards: ClazzType<T>[]
): MethodDecorator {
  return function (target: object | any, propertyKey?: string | symbol): void {
    if (propertyKey) {
      Reflect.defineMetadata(
        USE_GUARD_OPTION_TOKEN,
        guards,
        target,
        propertyKey,
      );
    } else {
      Reflect.defineMetadata(USE_GUARD_OPTION_TOKEN, guards, target);
    }
  };
}
