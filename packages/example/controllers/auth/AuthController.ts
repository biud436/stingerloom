import { Controller, Get, Post } from "@stingerloom/common";
import { Session } from "@stingerloom/common/decorators/Session";
import { SessionObject } from "@stingerloom/common";
import { AuthService } from "./AuthService";

@Controller("/auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("/login")
    async login(@Session() session: SessionObject) {
        return await this.authService.login(session);
    }

    @Get("/session")
    async checkSession(@Session() session: SessionObject) {
        return await this.authService.checkSession(session);
    }
}
