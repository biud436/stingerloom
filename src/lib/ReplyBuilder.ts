import { FastifyReply } from "fastify";

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
        this._reply.code(200);
        return this;
    }

    statusCreated(): this {
        this._reply.code(201);
        return this;
    }

    statusBadRequest(): this {
        this._reply.code(400);
        return this;
    }

    statusUnauthorized(): this {
        this._reply.code(401);
        return this;
    }

    statusForbidden(): this {
        this._reply.code(403);
        return this;
    }

    statusInternalServerError(): this {
        this._reply.code(500);
        return this;
    }

    response<T>(data: T): T {
        return data;
    }
}
