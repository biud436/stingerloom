import { Injectable, SessionObject } from "@stingerloom/common";
import { ResultUtils } from "@stingerloom/example/common/ResultUtils";

@Injectable()
export class AuthService {
    async login(session: SessionObject) {
        session.authenticated = true;

        return ResultUtils.successWrap({
            message: "로그인에 성공하였습니다.",
            result: "success",
            data: session.cookie.path,
        });
    }

    async checkSession(session: SessionObject) {
        return ResultUtils.success("세션 인증에 성공하였습니다", {
            authenticated: session.authenticated,
        });
    }
}
