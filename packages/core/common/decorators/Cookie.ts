import { createCustomParamDecorator } from "./decoratorFactory";
import { HttpRequest } from "../http/interfaces";

export const Cookie = (name: string) =>
    createCustomParamDecorator((data, context) => {
        const request = context.req as HttpRequest;
        const cookie = request?.cookies as Record<string, unknown>;

        return cookie[name];
    })();
