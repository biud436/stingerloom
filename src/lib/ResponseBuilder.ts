export class ResponseBuilder<T = unknown> {
    status?: number;
    result?: string;
    _data?: unknown;

    constructor(private data: T) {}

    statusOK(): this {
        this.status = 200;
        return this;
    }

    statusCreated(): this {
        this.status = 201;
        return this;
    }

    statusBadRequest(): this {
        this.status = 400;
        return this;
    }

    statusUnauthorized(): this {
        this.status = 401;
        return this;
    }

    statusForbidden(): this {
        this.status = 403;
        return this;
    }

    statusInternalServerError(): this {
        this.status = 500;
        return this;
    }

    success(): this {
        this.result = "success";
        return this;
    }

    failure(): this {
        this.result = "failure";

        return this;
    }

    response() {
        return {
            status: this.status,
            result: this.result,
            data: this.data,
        };
    }
}
