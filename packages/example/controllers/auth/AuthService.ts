import {
    AfterTransaction,
    BeforeTransaction,
    Commit,
    InjectDataSource,
    Injectable,
    SessionObject,
    TransactionIsolationLevel,
    Transactional,
    TransactionalZone,
} from "@stingerloom/common";
import { ResultUtils } from "@stingerloom/example/common/ResultUtils";
import { LoginUserDto } from "./dto/LoginUserDto";
import { UserService } from "../user/UserService";
import { DataSource, EntityManager } from "typeorm";
import { User } from "@stingerloom/example/entity/User";
import { plainToClass } from "class-transformer";
import { Exception, InternalServerException } from "@stingerloom/error";
import { FastifyRequest } from "fastify";
import { Point } from "@stingerloom/example/entity/Point";
import { Autowired } from "@stingerloom/common/decorators/Autowired";

@TransactionalZone()
@Injectable()
export class AuthService {
    @Autowired()
    myPoint!: Point;

    @Autowired()
    userService!: UserService;

    constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

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

    async logout(
        req: FastifyRequest & {
            destroySession(callback: (err?: Error) => void): void;
        },
        session: SessionObject,
    ) {
        if (!session) {
            throw new InternalServerException("세션이 존재하지 않습니다.");
        }

        if (!session.authenticated) {
            throw new InternalServerException("로그인되어 있지 않습니다.");
        }

        return new Promise((resolve, reject) => {
            req.destroySession((err) => {
                if (err) {
                    reject(err);
                }
                resolve(ResultUtils.success("로그아웃에 성공하였습니다.", {}));
            });
        });
    }

    async checkSession(session: SessionObject) {
        return ResultUtils.success("세션 인증에 성공하였습니다", {
            authenticated: session.authenticated,
            user: session.user,
        });
    }

    /**
     * Transaction EntityManager를 사용하여 트랜잭션을 제어합니다.
     * @param em
     * @returns
     */
    @Transactional({
        isolationLevel: TransactionIsolationLevel.REPEATABLE_READ,
        transactionalEntityManager: true,
    })
    async checkTransaction(em?: EntityManager) {
        const users = (await em?.queryRunner?.query(
            "SELECT * FROM user;",
        )) as User[];

        return ResultUtils.success("트랜잭션을 확인하였습니다.", {
            users: plainToClass(User, users),
        });
    }

    @BeforeTransaction()
    async beforeTransaction(txId: string) {
        console.log(`[${txId}] 트랜잭션을 시작합니다.`);
    }

    @AfterTransaction()
    async afterTransaction(txId: string) {
        console.log(`[${txId}] 트랜잭션을 종료합니다.`);
    }

    @Commit()
    async commit(txId: string) {
        console.log(`[${txId}] 트랜잭션을 커밋합니다.`);
    }

    @Transactional()
    async checkTransaction2() {
        const users = await this.userService.findAll();
        return ResultUtils.success("트랜잭션을 확인하였습니다1", {
            users: plainToClass(User, users),
            other: await this.checkTransaction3(),
        });
    }

    @Transactional()
    async checkTransaction3() {
        const users = await this.userService.findAll();

        return users;
    }

    async checkTransaction4() {
        const queryRunner = this.dataSource.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const test1 = await this.userService.createWithNonTransactional({
                password: "testtest1aA!!",
                username: "test1",
            });

            const test2 = await this.userService.createWithNonTransactional({
                password: "testtest1aA!!",
                username: "test2",
            });

            return {
                users: {
                    test1,
                    test2,
                },
            };
        } catch {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    @Transactional({
        rollback: () => new Exception("트랜잭션이 롤백되었어요", 500),
    })
    async rollbackCheck() {
        const user = await this.userService.findOneByPk("test");

        return ResultUtils.success("롤백 테스트", {
            user,
        });
    }
}
