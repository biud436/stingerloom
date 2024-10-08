import { FastifyRequest } from "fastify";
import { createCustomParamDecorator } from "./decoratorFactory";

export const Hostname = () =>
    createCustomParamDecorator((data, context) => {
        const request = context.req as FastifyRequest;
        const hostname = request?.hostname as string;

        return hostname;
    })();
