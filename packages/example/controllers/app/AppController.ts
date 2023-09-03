import { Controller, UseGuard, View } from "@stingerloom/common";
import { SessionGuard } from "../auth/guards/SessionGuard";
import { User } from "@stingerloom/example/common/decorators/User";
import { User as UserEntity } from "@stingerloom/example/entity/User";

@Controller("/")
export class AppController {
    /**
     * 로그인 페이지를 표시합니다.
     */
    @View("login")
    login() {
        return {
            username: "아이디",
            password: "비밀번호",
        };
    }

    /**
     * 로그인된 유저만 접근할 수 있는 페이지입니다.
     */
    @View("memberInfo")
    @UseGuard(SessionGuard)
    async memberInfo(@User() user: UserEntity) {
        return {
            username: user.username,
        };
    }
}
