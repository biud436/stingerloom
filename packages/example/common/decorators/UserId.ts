import { SessionObject } from "@stingerloom/common";
import { createCustomParamDecoractor } from "@stingerloom/common/decorators/decoratorFactory";

export const UserId = createCustomParamDecoractor((data, context) => {
    const req = context.req;
    const session = req.session as SessionObject;

    if (!session) {
        return null;
    }

    return session.user.id;
});
