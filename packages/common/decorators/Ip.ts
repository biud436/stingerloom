import { FastifyRequest } from "fastify";
import { createCustomParamDecorator } from "./decoratorFactory";

export const Ip = createCustomParamDecorator((data, context) => {
    const request = context.req as FastifyRequest;
    return request.ip;
});
