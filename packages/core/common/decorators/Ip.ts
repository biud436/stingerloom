import { createCustomParamDecorator } from "./decoratorFactory";

export const Ip = createCustomParamDecorator((data, context) => {
    const request = context.req;
    return request.ip;
});
