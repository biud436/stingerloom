import { FastifyReply } from "fastify";
import { HttpStatus } from "./HttpStatus";

export class ReplyBuilder {
    constructor(private _reply: FastifyReply) {}

    appendHeader(key: string, value: string): this {
        this._reply.header(key, value);
        return this;
    }

    json(): this {
        this._reply.header("Content-Type", "application/json");
        return this;
    }

    statusOK(): this {
        this._reply.code(HttpStatus.OK);
        return this;
    }

    statusCreated(): this {
        this._reply.code(HttpStatus.CREATED);
        return this;
    }

    statusBadRequest(): this {
        this._reply.code(HttpStatus.BAD_REQUEST);
        return this;
    }

    statusUnauthorized(): this {
        this._reply.code(HttpStatus.UNAUTHORIZED);
        return this;
    }

    statusForbidden(): this {
        this._reply.code(HttpStatus.FORBIDDEN);
        return this;
    }

    statusInternalServerError(): this {
        this._reply.code(HttpStatus.INTERNAL_SERVER_ERROR);
        return this;
    }

    response<T>(data: T): T {
        return data;
    }
}
