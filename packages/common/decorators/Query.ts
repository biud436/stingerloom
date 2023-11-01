import { FastifyRequest } from "fastify";
import { createCustomParamDecorator } from "./decoratorFactory";
import { BadRequestException } from "@stingerloom/error";
import { isNumber } from "class-validator";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ValidationHandler } from "../ValidationHandler";

export const Query = (rawName?: string) =>
    createCustomParamDecorator(async (data, context) => {
        const request = context.req as FastifyRequest;
        const query = request?.query as Record<string, unknown>;

        if (rawName) {
            const [name, defaultValue] = rawName
                .split("|")
                .map((x) => x.trim());
            const result = query[name];

            if (context.type) {
                const type = context.type();

                if (type === Number) {
                    const r = Number(result) ?? Number(defaultValue);

                    if (!isNumber(r)) {
                        throw new BadRequestException(
                            `매개변수 ${r}은 숫자가 아닙니다.`,
                        );
                    }

                    return r;
                }

                if (type === String) {
                    return result === ""
                        ? defaultValue
                        : String(result) ?? String(defaultValue);
                }

                if (type === Boolean) {
                    return Boolean(result) ?? Boolean(defaultValue);
                }

                return new type(result) ?? new type(defaultValue);
            }

            return result;
        }

        if (!context.type || !context.res) return query;

        const type = context.type();

        console.log("타입 감지", type);

        const result = plainToInstance(type, query);

        console.log("결과", result);
        const handler = new ValidationHandler(context.res, [validate(result)]);
        if (await handler.isError()) {
            return handler.getResponse();
        }

        return result;
    })();
