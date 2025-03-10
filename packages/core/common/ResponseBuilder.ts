import { HttpStatus } from "./HttpStatus";

export class ResponseBuilder<T = unknown> {
  status?: number;
  result?: string;
  _data?: unknown;

  constructor(private data: T) {}

  statusOK(): this {
    this.status = HttpStatus.OK;
    return this;
  }

  statusCreated(): this {
    this.status = HttpStatus.CREATED;
    return this;
  }

  statusBadRequest(): this {
    this.status = HttpStatus.BAD_REQUEST;
    return this;
  }

  statusUnauthorized(): this {
    this.status = HttpStatus.UNAUTHORIZED;
    return this;
  }

  statusForbidden(): this {
    this.status = HttpStatus.FORBIDDEN;
    return this;
  }

  statusInternalServerError(): this {
    this.status = HttpStatus.INTERNAL_SERVER_ERROR;
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
