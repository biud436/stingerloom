import { FastifyRequest } from "fastify";
import { createCustomParamDecorator } from "./decoratorFactory";

export const Param = (name: string) =>
    createCustomParamDecorator((data, context) => {
        const request = context.req as FastifyRequest;
        const params = request?.params as Record<string, unknown>;

        const result = params[name];

        if (context.type) {
            const type = context.type();

            if (type === Number) {
                return Number(result);
            }

            if (type === String) {
                return String(result);
            }

            if (type === Boolean) {
                return Boolean(result);
            }

            return new type(result);
        }

        return result;
    })();
