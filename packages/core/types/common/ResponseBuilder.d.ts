export declare class ResponseBuilder<T = unknown> {
    private data;
    status?: number;
    result?: string;
    _data?: unknown;
    constructor(data: T);
    statusOK(): this;
    statusCreated(): this;
    statusBadRequest(): this;
    statusUnauthorized(): this;
    statusForbidden(): this;
    statusInternalServerError(): this;
    success(): this;
    failure(): this;
    response(): {
        status: number | undefined;
        result: string | undefined;
        data: T;
    };
}
