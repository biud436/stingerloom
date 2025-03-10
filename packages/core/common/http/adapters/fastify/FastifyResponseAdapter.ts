/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyReply } from "fastify";
import { HttpResponse } from "../../interfaces";

type FastifyReplyWithView = FastifyReply & {
  view?: (path: string, data: any) => void;
};

/**
 * Fastify의 응답 객체를 프레임워크의 HttpResponse로 변환하는 어댑터
 */
export class FastifyResponseAdapter implements HttpResponse {
  constructor(private fastifyReply: FastifyReply) {}

  status(code: number): this {
    this.fastifyReply.status(code);
    return this;
  }

  send(body: any): void {
    this.fastifyReply.send(body);
  }

  json(body: any): void {
    this.fastifyReply.send(body);
  }

  setHeader(name: string, value: string): this {
    this.fastifyReply.header(name, value);
    return this;
  }

  view(path: string, data: any): void {
    const res = this.fastifyReply as FastifyReplyWithView;

    if (res.view) {
      res.view(path, data);
    }
  }
}
