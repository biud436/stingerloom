import { createCustomParamDecorator } from "./decoratorFactory";
import { BadRequestException } from "@stingerloom/error";
import { isNumber } from "class-validator";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ValidationHandler } from "../ValidationHandler";

export const Query = (rawName?: string) =>
    createCustomParamDecorator(
        async (data, { req, res, type: contextType }) => {
            const request = req;
            const query = <Record<string, unknown>>request?.query;

            if (rawName) {
                const [name, defaultValue] = rawName
                    .split("|")
                    .map((x) => x.trim());
                const result = query[name];

                if (contextType) {
                    const type = contextType();

                    if (type === Number) {
                        const r = Number(result) ?? Number(defaultValue);

                        if (!isNumber(r)) {
                            throw new BadRequestException(
                                `the parameter named ${r} is not a number. Please check the parameter type.`,
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

            if (!contextType || !res) return query;

            const type = contextType();
            const result = plainToInstance(type, query);
            const handler = new ValidationHandler(res, [validate(result)]);
            if (await handler.isError()) {
                return handler.getResponse();
            }

            return result;
        },
    )();
