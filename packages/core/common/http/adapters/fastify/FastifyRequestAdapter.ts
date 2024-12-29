/* eslint-disable @typescript-eslint/no-explicit-any */
import { FastifyRequest } from "fastify";
import { HttpRequest } from "../../interfaces";

/**
 * Fastify의 요청 객체를 프레임워크의 HttpRequest로 변환하는 어댑터
 */
export class FastifyRequestAdapter implements HttpRequest {
    constructor(private fastifyRequest: FastifyRequest) {}

    get body(): any {
        return this.fastifyRequest.body;
    }

    get params(): Record<string, string> {
        return this.fastifyRequest.params as Record<string, string>;
    }

    get query(): Record<string, string> {
        return this.fastifyRequest.query as Record<string, string>;
    }

    get headers(): Record<string, string> {
        return this.fastifyRequest.headers as Record<string, string>;
    }

    get session(): any {
        return (this.fastifyRequest as any).session;
    }

    get ip(): string {
        return this.fastifyRequest.ip;
    }

    get cookies(): Record<string, unknown> {
        return (this.fastifyRequest as any).cookies as Record<string, unknown>;
    }

    get hostname(): string {
        return this.fastifyRequest.hostname;
    }
}
