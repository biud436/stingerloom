import {
    Guard,
    Injectable,
    ServerContext,
    SessionObject,
} from "@stingerloom/common";

@Injectable()
export class SessionGuard implements Guard {
    canActivate(context: ServerContext): Promise<boolean> | boolean {
        const req = context.req;
        const session = req.session as SessionObject;

        if (!session) {
            return false;
        }

        if (!session.authenticated) {
            return false;
        }

        return true;
    }
}
