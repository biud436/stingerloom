import { Injectable, SessionObject } from "@stingerloom/common";

@Injectable()
export class AuthService {
    async login(session: SessionObject) {
        session.authenticated = true;

        return {
            message: "로그인에 성공하였습니다.",
            status: 200,
            data: session.cookie.path,
        };
    }

    async checkSession(session: SessionObject) {
        return {
            authenticated: session.authenticated,
        };
    }
}
