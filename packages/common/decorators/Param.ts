import { FastifyRequest } from "fastify";
import { createCustomParamDecorator } from "./decoratorFactory";

export const Param = (name: string) =>
    createCustomParamDecorator((data, context) => {
        const request = context.req as FastifyRequest;
        const params = request?.params as Record<string, unknown>;

        return params[name];
    })();
