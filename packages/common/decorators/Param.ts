import { FastifyRequest } from "fastify";
import { createCustomParamDecorator } from "./decoratorFactory";

export const Param = (rawName: string) =>
    createCustomParamDecorator((data, context) => {
        const request = context.req as FastifyRequest;
        const params = request?.params as Record<string, unknown>;

        const [name, defaultValue] = rawName.split("|").map((x) => x.trim());

        const result = params[name];

        if (context.type) {
            const type = context.type();

            if (type === Number) {
                return Number(result) ?? Number(defaultValue);
            }

            if (type === String) {
                return result ?? defaultValue;
            }

            if (type === Boolean) {
                return Boolean(result) ?? Boolean(defaultValue);
            }

            return new type(result) ?? new type(defaultValue);
        }

        return result;
    })();
