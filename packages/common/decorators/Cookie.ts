import { FastifyRequest } from "fastify";
import { createCustomParamDecorator } from "./decoratorFactory";

export const Cookie = (name: string) =>
    createCustomParamDecorator((data, context) => {
        const request = context.req as FastifyRequest;
        const cookie = request?.cookies as Record<string, unknown>;

        return cookie[name];
    })();
