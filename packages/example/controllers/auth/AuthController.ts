import { Body, Controller, Get, Post } from "@stingerloom/common";
import { Session } from "@stingerloom/common/decorators/Session";
import { SessionObject } from "@stingerloom/common";
import { AuthService } from "./AuthService";
import { LoginUserDto } from "./dto/LoginUserDto";

@Controller("/auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("/login")
    async login(
        @Session() session: SessionObject,
        @Body() loginUserDto: LoginUserDto,
    ) {
        return await this.authService.login(session, loginUserDto);
    }

    @Get("/session")
    async checkSession(@Session() session: SessionObject) {
        return await this.authService.checkSession(session);
    }
}
