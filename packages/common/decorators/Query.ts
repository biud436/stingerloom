import { FastifyRequest } from "fastify";
import { createCustomParamDecorator } from "./decoratorFactory";

export const Query = (name: string) =>
    createCustomParamDecorator((data, context) => {
        const request = context.req as FastifyRequest;
        const query = request?.query as Record<string, unknown>;

        const result = query[name];

        if (context.type) {
            const type = context.type();

            if (type === Number) {
                return Number(result);
            }

            if (type === String) {
                return result;
            }

            if (type === Boolean) {
                return Boolean(result);
            }

            return new type(result);
        }

        return result;
    })();
