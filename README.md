# Introduction

이 서버 프레임워크는 Nest.js라는 서버 프레임워크의 동작 원리와 기술을 더 깊이 이해하기 위해서 시작되었습니다.

`나만의 서버 프레임워크를 만들어보자`라는 의미도 있습니다.

`나만의 서버 프레임워크`의 이름은 StingerLoom이며 라우터 맵핑 기능과 StingerLoom Container에 의한 DI와 데이터베이스 접근에 필요한 ORM 등의 기능을 지원합니다.

## 개발 일지

이 프레임워크를 만들면서 제가 고민했던 내용들을 아래 링크에 정리해두었습니다.

-   [나만의 Node.js 서버 프레임워크 개발기 2편](https://blog.naver.com/biud436/223192980484)
-   [나만의 Node.js 서버 프레임워크 개발기 1편](https://blog.naver.com/biud436/223163267550)

Fastify나 Express에 종속성 없는 설계, Guards, Redis, Cache, OpenAPI (Swagger) 등 다양한 기능을 지원하기 위해서는 아직도 많은 고민이 필요합니다.

## 사용한 기술

본 서버 프레임워크는 아래의 기술을 사용하였습니다.

또한 fastify에 기반한 프레임워크이므로 fastify에 강한 의존성을 가지고 있습니다.

-   fastify
-   typeorm
-   typedi
-   reflect-metadata
-   mariadb
-   class-transformer
-   class-validator
-   http-status

ORM은 typeorm을 사용하였으며, Body 데코레이터의 직렬화/역직렬화를 위해서 class-transformer와 class-validator를 사용하였습니다.

또한 메타데이터 수집을 위해서 reflect-metadata를 사용하였습니다.

# 사용법

이 프레임워크는 `Controller`, `Get`, `Post`, `Patch`, `Delete`, `Put`, `InjectRepository`, `Req`, `Body`, `Header`, `ExceptionFilter`, `Catch`, `BeforeCatch`, `AfterCatch`, `Injectable`, `Session`, `Transactional`, `TransactionalZone`, `InjectQueryRunner` 데코레이터를 지원합니다.

-   [Controller](https://github.com/biud436/stingerloom#controller)
-   [Injectable](https://github.com/biud436/stingerloom#injectable)
-   [Exception Filter와 실행 컨텍스트](https://github.com/biud436/stingerloom#exception-filter%EC%99%80-%EC%8B%A4%ED%96%89-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8)
-   [트랜잭션의 처리](https://github.com/biud436/stingerloom#%ED%8A%B8%EB%9E%9C%EC%9E%AD%EC%85%98%EC%9D%98-%EC%B2%98%EB%A6%AC)
-   [세션 인증](https://github.com/biud436/stingerloom#%EC%9D%B8%EC%A6%9D)

## Controller

컨트롤러는 클라이언트가 보내는 요청을 처리하고 응답하는 클래스입니다.

<p align="center">
<img src="https://github.com/biud436/stingerloom/assets/13586185/366498a8-c871-400f-8ca4-4742a9e5110d" />
</p>

`@Controller` 데코레이터는 HTTP 요청을 특정 경로에 해당하는 컨트롤러로 보내기 위한 메타데이터를 수집하며 알맞은 라우팅 맵을 형성할 수 있도록 해줍니다.

```ts
@Controller("/user")
export class UserController {
    constructor(
        private readonly point: Point,
        private readonly userService: UserService,
    ) {}

    @Get("/point")
    async getPoint() {
        this.point.move(5, 5);
        return {
            x: this.point.x,
            y: this.point.y,
        };
    }

    @Post()
    public async create(@Body() createUserDto: CreateUserDto) {
        return await this.userService.create(createUserDto);
    }

    @Header("Content-Type", "application/json")
    @Get()
    public async getUser(@Req() req: FastifyRequest) {
        return await this.userService.getUser(req.ip);
    }
}
```

라우팅 맵은 StingerLoom에서 알아서 처리하므로 사용자는 기존처럼 라우팅 맵을 일일히 작성할 필요가 없습니다.

위 코드에 보이는 `@Body()` 데코레이터는 요청의 바디를 역직렬화하여 `createUserDto`에 할당하며 유효성 검사를 수행합니다. 보통 유효성 검사가 실패하는 경우에는 400 오류가 발생하게 됩니다.

`@Req()` 데코레이터를 붙이면 FastifyRequest 인스턴스를 주입받을 수 있습니다.

또한 `@Header()` 데코레이터는 응답 헤더를 설정합니다. 이 데코레이터는 메소드에만 붙일 수 있고 생략할 경우 기본적으로 `Content-Type: application/json` 헤더가 설정됩니다.

주의해야 할 점은 생성자 부분인데요.

```ts
@Controller("/user")
export class UserController {
    constructor(
        // 1. Point는 injectable한 클래스가 아니므로 매번 인스턴스화됩니다.
        private readonly point: Point,
        // 2. UserService는 injectable한 클래스이므로 싱글톤 인스턴스로 관리됩니다.
        private readonly userService: UserService,
    ) {}
```

아래 `@Injectable` 챕터에서 설명되겠지만 아래 `Point` 클래스는 `@Injectable` 데코레이터가 붙지 않았기 때문에 컨테이너에서 관리되지 않습니다. 요청 당이 아니며 각 컨트롤러 또는 `Injectable`한 클래스에 주입될 때마다 새로운 인스턴스가 생성됩니다.

```ts
export class Point {
    public x: number;
    public y: number;

    constructor() {
        this.x = 0;
        this.y = 0;
    }

    public move(x: number, y: number) {
        this.x += x;
        this.y += y;
    }
}
```

따라서 `/user/point`를 연달아 호출하면 아래와 같이 출력될 것입니다.

```json
{"x":5,"y":5}
{"x":10,"y":10}
```

반대로 `Injectable`한 클래스는 싱글톤 인스턴스로 관리되므로 요청 당이 아니라 컨트롤러 또는 `Injectable`한 클래스에 주입될 때마다 같은 인스턴스가 주입됩니다.

이에 대한 예시는 다음 섹션인 [Injectable](https://github.com/biud436/stingerloom#injectable)을 참고하시기 바랍니다.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## Injectable

`@Injectable` 데코레이터가 붙은 클래스는 다른 클래스의 생성자에 주입될 수 있습니다. 또한 생성자 매개변수의 타입을 분석하여 인스턴스를 오직 하나만 생성하는 서버 컨테이너에서 관리하는 싱글톤 인스턴스로 만들어줍니다.

하지만 `@Injectable` 데코레이터를 붙이지 않아도 여전히 주입이 가능합니다. 그러나 `@Injectable` 데코레이터가 마킹되어있지 않은 경우, 이 클래스는 단순히 디폴트 생성자를 통해 매번 인스턴스화되며, 서버 컨테이너에서 관리되지 않습니다.

```ts
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly discoveryService: DiscoveryService,
    ) {}

    async create(createUserDto: CreateUserDto) {
        const safedUserDto = createUserDto as Record<string, any>;
        if (safedUserDto.role) {
            throw new BadRequestException("role 속성은 입력할 수 없습니다.");
        }

        const newUser = await this.userRepository.create(createUserDto);
        const res = await this.userRepository.save(newUser);

        return ResultUtils.success("유저 생성에 성공하였습니다.", res);
    }

    async validateUser(loginUserDto: LoginUserDto): Promise<User> {
        const { username, password } = loginUserDto;

        const user = await this.userRepository
            .createQueryBuilder("user")
            .select()
            .where("user.username = :username", {
                username,
            })
            .getOne();

        if (!user) {
            throw new BadRequestException("존재하지 않는 유저입니다.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException("비밀번호가 일치하지 않습니다.");
        }

        return user;
    }

    async getUser(ip: string) {
        const user = await this.userRepository.find();
        return ResultUtils.success("유저 조회에 성공하였습니다", {
            user,
            ip,
        });
    }
}
```

강조해서 설명하고 있는 싱글턴 인스턴스라는 것은 인스턴스를 단 하나만 생성하겠다는 소리입니다. 즉, 모든 컨트롤러 또는 `Injectable`한 클래스에 주입될 때마다 정확히 같은 인스턴스가 주입되는 것입니다.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## Exception Filter와 실행 컨텍스트

Exception Filter는 오류를 처리 및 재정의할 수 있는 데코레이터입니다. `@ExceptionFilter` 데코레이터를 붙이고 데코레이터의 인자로는 오류 클래스를 지정합니다. 이후에는 해당 오류 클래스에 해당하는 오류가 발생하면 `@Catch` 데코레이터가 붙은 메소드가 실행됩니다.
`@BeforeCatch` 데코레이터가 붙은 메소드는 `@Catch` 데코레이터가 붙은 메소드가 실행되기 전에 실행되고, `@AfterCatch` 데코레이터가 붙은 메소드는 `@Catch` 데코레이터가 붙은 메소드가 실행된 후에 실행됩니다.

```ts
@ExceptionFilter(InternalServerException)
export class InternalErrorFilter implements Filter {
    private readonly logger = new Logger();

    @BeforeCatch()
    public beforeCatch() {
        this.logger.info("before catch");
    }

    @Catch()
    public catch(error: any) {
        this.logger.info("[서버 내부 오류] " + error.message);

        return {
            message: error.message,
            status: error.status,
            result: "failure",
        };
    }

    @AfterCatch()
    public afterCatch() {
        this.logger.info("after catch");
    }
}
```

이렇게 하면 아래와 같이 출력됩니다.

<p align="center">
<img src="https://github.com/biud436/custom-server-framework/assets/13586185/998fe1e3-f705-4a9c-a453-7179f42fc770" />
</p>

예외 메소드는 `@BeforeCatch -> @Catch -> @AfterCatch` 순으로 실행됩니다. 각 예외 컨텍스트는 예외 처리 클래스 당 하나의 인스턴스를 공유하는 공유 인스턴스입니다.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## 트랜잭션의 처리

StingerLoom에서는 트랜잭션 처리를 위해서 `@Transactional` 데코레이터를 지원합니다. 트랜잭션 격리 수준은 생략 시 `REPETABLE READ`가 기본값입니다.

이 기능은 `@Injectable` 데코레이터가 붙은 클래스에만 적용됩니다. 또한 트랜잭션 처리를 위해서는 `@TransactionalZone` 데코레이터를 클래스에 마킹하여야 합니다.

`@TransactionalZone` 데코레이터는 트랜잭션 처리를 위한 `EntityManager`를 주입받을 메소드를 찾아내는데요.

다음은 트랜잭션을 처리하는 심플한 예시입니다.

### Transaction Entity Manager를 사용하는 경우

`transactionalEntityManager` 속성을 `true`로 설정하면 다중 트랜잭션 처리를 위한 `Transaction Entity Manager`를 자동으로 주입받을 수 있습니다.

```ts
@TransactionalZone()
@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {}

    // Skip...

    /**
     * Transaction EntityManager를 사용하여 트랜잭션을 제어합니다.
     * @param em
     * @returns
     */
    @Transactional({
        isolationLevel: "REPEATABLE READ",
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
}
```

반드시 트랜잭션 엔티티 매니저를 사용해야 트랜잭션으로 처리가 됩니다.

### `QueryRunner`를 사용하는 경우 (추천)

`QueryRunner`를 사용하는 경우, 트랜잭션을 상세하게 제어할 수 있습니다. `@Transactional()`이라고 표시된 메소드는 자동으로 `QueryRunner`를 주입받습니다.

오류가 발생하면 자동으로 롤백됩니다.

```ts
@TransactionalZone()
@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {}

    /**
     * QueryRunner를 사용하여 트랜잭션을 제어합니다.
     * @param queryRunner
     * @returns
     */
    @Transactional()
    async checkTransaction2(@InjectQueryRunner() queryRunner?: QueryRunner) {
        const users = await queryRunner?.query("SELECT * FROM user;");

        return ResultUtils.success("트랜잭션을 확인하였습니다.", {
            users: plainToClass(User, users),
        });
    }
}
```

반환까지 오류가 발생하지 않으면 트랜잭션이 정상적으로 커밋됩니다.

QueryRunner를 정확히 위치에 주입하기 위해 매개변수에 `@InjectQueryRunner()`를 마킹해야 합니다.

```ts
@TransactionalZone()
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly discoveryService: DiscoveryService,
    ) {}

    @Transactional()
    async create(
        createUserDto: CreateUserDto,
        @InjectQueryRunner() queryRunner?: QueryRunner,
    ) {
        const safedUserDto = createUserDto as Record<string, any>;
        if (safedUserDto.role) {
            throw new BadRequestException("role 속성은 입력할 수 없습니다.");
        }

        const newUser = await this.userRepository.create(createUserDto);
        const res = await queryRunner?.manager.save(newUser);

        console.log("res", res);

        return ResultUtils.success("유저 생성에 성공하였습니다.", res);
    }

    // Skip...
}
```

위는 회원 가입에 대한 예시입니다.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## 인증

StingerLoom에선 세션 기반 인증을 지원합니다.

```ts
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
```

다만 현재는 핸들러 전에 실행되는 인증 가드(AuthGuard) 개념과 인가 처리에 필요한 Role 개념이 구현되어있지 않습니다.

이 부분은 추후에 구현될 예정입니다.

```ts
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
}
```

현재 버전에서는 위와 같이 세션 오브젝트를 사용하여 인증을 구현할 수 있습니다.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## Installations

before starting this application, you must install dependencies as below in your terminal.

```
yarn install
```

or

```bash
npm install
```

and then next you have to create a new file named `.env` due to database configuration in the root directory. First up, you copy the `.env.example` file and then rename it to `.env` and then you change the value of the variable in the `.env` file.

```bash
# .env.example
SERVER_PORT=3002
DB_HOST=localhost
DB_PORT=3306
DB_NAME=test
DB_USER=<your_db_user>
DB_PASSWORD=<your_db_password>
SESSION_SECRET=<your_session_secret>
COOKIE_SECRET=<your_cookie_secret>
```

and then next you can start this application with this command.

```bash
yarn start
```
