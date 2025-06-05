/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpResponse } from "../../interfaces";
import { Response } from "express";

/**
 * Express의 응답 객체를 프레임워크의 HttpResponse로 변환하는 어댑터
 * fastify는 내부적으로 상태를 추적하지만 express는 상태를 추적하지 않으므로,
 * 메서드 체이닝을 사용하여 상태를 갱신하도록 해야 합니다.
 */
export class ExpressResponseAdapter implements HttpResponse {
  constructor(private expressResponse: Response) {}

  private chaining(response: Response): this {
    this.expressResponse = response;
    return this;
  }

  status(code: number): this {
    this.chaining(this.expressResponse.status(code));
    return this;
  }

  send(body: any): void {
    // send()는 체이닝의 끝점이므로 void 반환 타입 적절
    this.expressResponse.send(body);
  }

  json(body: any): void {
    // json()도 체이닝의 끝점
    this.expressResponse.json(body);
  }

  setHeader(name: string, value: string | number | string[]): this {
    // express의 setHeader는 void를 반환하므로 체이닝을 사용하지 않습니다.
    this.expressResponse.setHeader(name, value);
    return this;
  }

  view(path: string, data?: Record<string, any>): void {
    if (typeof this.expressResponse.render === "function") {
      this.expressResponse.render(path, data);
    }
  }
}
