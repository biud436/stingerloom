import { createCustomParamDecorator } from "./decoratorFactory";
import { BadRequestException } from "../../error";

export const Param = (rawName: string) =>
    createCustomParamDecorator((data, context) => {
        const request = context.req;
        const params = request?.params as Record<string, unknown>;

        const [name, defaultValue] = rawName.split("|").map((x) => x.trim());

        const result = params[name];

        if (context.type) {
            const type = context.type();

            if (type === Number) {
                const r = Number(result) ?? Number(defaultValue);

                if (isNaN(r)) {
                    throw new BadRequestException(
                        `매개변수 ${r}은 숫자가 아닙니다.`,
                    );
                }

                return r;
            }

            if (type === String) {
                return result === ""
                    ? defaultValue
                    : (String(result) ?? String(defaultValue));
            }

            if (type === Boolean) {
                return Boolean(result) ?? Boolean(defaultValue);
            }

            return new type(result) ?? new type(defaultValue);
        }

        return result;
    })();
