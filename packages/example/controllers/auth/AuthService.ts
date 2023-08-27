import {
    Injectable,
    SessionObject,
    Transactional,
    TransactionalZone,
} from "@stingerloom/common";
import { ResultUtils } from "@stingerloom/example/common/ResultUtils";
import { LoginUserDto } from "./dto/LoginUserDto";
import { UserService } from "../user/UserService";
import { EntityManager } from "typeorm";
import { User } from "@stingerloom/example/entity/User";
import { plainToClass } from "class-transformer";

@TransactionalZone()
@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {}

    async login(session: SessionObject, loginUserDto: LoginUserDto) {
        const user = await this.userService.validateUser(loginUserDto);
        session.authenticated = true;
        session.user = user;

        return ResultUtils.successWrap({
            message: "로그인에 성공하였습니다.",
            result: "success",
            data: session.user,
        });
    }

    async checkSession(session: SessionObject) {
        return ResultUtils.success("세션 인증에 성공하였습니다", {
            authenticated: session.authenticated,
            user: session.user,
        });
    }

    @Transactional({
        isolationLevel: "REPEATABLE READ",
    })
    async checkTransaction(em?: EntityManager) {
        const users = (await em?.queryRunner?.query(
            "SELECT * FROM user;",
        )) as User[];

        return ResultUtils.success("트랜잭션을 확인하였습니다.", {
            users: plainToClass(User, users),
        });
    }
}
