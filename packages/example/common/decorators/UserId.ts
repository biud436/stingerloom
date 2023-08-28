import { SessionObject } from "@stingerloom/common";
import { createCustomParamDecorator } from "@stingerloom/common/decorators/decoratorFactory";

export const UserId = createCustomParamDecorator((data, context) => {
    const req = context.req;
    const session = req.session as SessionObject;

    if (!session) {
        return null;
    }

    return session.user.id;
});
