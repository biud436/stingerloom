import { createCustomParamDecorator } from "./decoratorFactory";

export const Hostname = () =>
    createCustomParamDecorator((data, context) => {
        const request = context.req;
        const hostname = request?.hostname as string;

        return hostname;
    })();
