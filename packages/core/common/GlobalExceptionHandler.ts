/* eslint-disable @typescript-eslint/no-explicit-any */
import { ErrorMetadata, ExceptionScanner, InstanceScanner } from "../IoC";
import { HttpContext } from "./http/interfaces/HttpContext";
import { HttpStatus } from "./HttpStatus";
import { ClazzType } from "./RouterMapper";
import { AdviceType } from "../IoC/AdviceType";
import { HttpError } from "./http";
import Container from "typedi";

export interface ExceptionHandler {
  handleException(error: HttpError, context: HttpContext): Promise<any>;
}

export class GlobalExceptionHandler implements ExceptionHandler {
  public async handleException(error: HttpError): Promise<any> {
    let errorData: any = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      ...error,
    };

    // 등록된 예외 처리기 실행
    const handledError = await this.executeExceptionFilters(error);
    if (handledError) {
      errorData = handledError;
    }

    // 상태 코드 설정
    const status =
      errorData?.status || error?.["code"] || HttpStatus.INTERNAL_SERVER_ERROR;

    return {
      status,
      body: errorData,
    };
  }

  private async executeExceptionFilters(error: HttpError): Promise<any> {
    const exceptionScanner = Container.get(ExceptionScanner);
    const instanceScanner = Container.get(InstanceScanner);

    for (const {
      target,
      exception,
      handlers,
    } of exceptionScanner.makeExceptions()) {
      if (error.name === exception.name) {
        const ExceptionFilter = target as ClazzType<any>;
        const context = instanceScanner.wrap(ExceptionFilter);

        return await this.executeHandlers(handlers, context, error);
      }
    }
    return null;
  }

  private async executeHandlers(
    handlers: ErrorMetadata[],
    context: any,
    error: HttpError,
  ): Promise<any> {
    let errorData = null;

    for (const handler of handlers) {
      const { advice, handler: handlerFn } = handler;

      switch (advice) {
        case AdviceType.THROWING:
          errorData = await (handlerFn as any).call(context, error);
          break;
        case AdviceType.BEFORE_THROWING:
        case AdviceType.AFTER_THROWING:
          await (handlerFn as any).call(context);
          break;
      }
    }

    return errorData;
  }
}
