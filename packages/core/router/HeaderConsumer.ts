/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ClazzType,
  HEADER_TOKEN,
  HeaderMetadata,
  HttpResponse,
} from "../common";

/**
 * @class HeaderConsumer
 * @description
 * 이 클래스는 헤더를 설정하기 위한 컨슈머 클래스입니다.
 */
export class HeaderConsumer {
  constructor(private readonly targetController: ClazzType<unknown>) {}

  public execute(res: HttpResponse, routerName: string) {
    const { targetController } = this;

    // Header Consumer
    const parameters = Reflect.getMetadata(
      HEADER_TOKEN,
      targetController,
      routerName,
    ) as HeaderMetadata[];

    if (parameters) {
      parameters.forEach((parameter: HeaderMetadata) => {
        res.setHeader(parameter.key, parameter.value);
      });
    }
  }
}
