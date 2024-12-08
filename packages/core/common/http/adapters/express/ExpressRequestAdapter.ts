/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { HttpRequest } from "../../interfaces";

export class ExpressRequestAdapter implements HttpRequest {
    constructor(private expressRequest: Request) {}

    get body(): any {
        return this.expressRequest.body;
    }

    get params(): Record<string, string> {
        return this.expressRequest.params as Record<string, string>;
    }

    get query(): Record<string, string> {
        return this.expressRequest.query as Record<string, string>;
    }

    get headers(): Record<string, string> {
        return this.expressRequest.headers as Record<string, string>;
    }

    get session(): any {
        return this.expressRequest.session;
    }

    get ip(): string {
        return this.expressRequest.ip || this.expressRequest.ips[0];
    }

    get cookies(): Record<string, unknown> {
        return this.expressRequest.cookies as Record<string, unknown>;
    }

    get hostname(): string {
        return this.expressRequest.hostname;
    }
}
