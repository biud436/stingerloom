import { Controller, Get, View } from "@stingerloom/common";

@Controller("/")
export class AppController {
    @Get("/login")
    @View("login")
    login() {
        return {
            username: "아이디",
            password: "비밀번호",
        };
    }
}
