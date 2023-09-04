# Introduction

This server framework was started to better understand the mechanics and technology behind a server framework called Nest.js.

By creating my own server framework, I wanted to gain a better understanding of frameworks and understand how Nest.js works.

The "build your own server framework" is named StingerLoom and supports features such as router mapping and the ORM needed to access database, and provide DI by the StingerLoom Container.

<p align="center"> 
<img src="https://github.com/biud436/stingerloom/assets/13586185/44f8f16a-d4b0-4beb-bb8c-78128da6265f" />
</p>

## Development journal

I've summarized my thoughts on creating this framework in the link below.

-   [Build Your Own Node.js Server Framework, Part 3 (Korean)](https://blog.naver.com/biud436/223198108682)
-   [Build Your Own Node.js Server Framework, Part 2 (Korean)](https://blog.naver.com/biud436/223192980484)
-   [Build Your Own Node.js Server Framework, Part 1 (Korean)](https://blog.naver.com/biud436/223163267550)

There's still a lot of work to be done to make Fastify or Express dependency-free, support Redis, Cache, OpenAPI (Swagger), and more.

## Techniques

This server framework uses the following technologies

It is also a framework based on fastify, so it has a strong dependency on fastify.

-   fastify
-   typeform
-   typedi
-   reflect-metadata
-   mariadb
-   class-transformer
-   class-validator
-   http-status

ORM used typeorm, and class-transformer and class-validator were used for serialization/deserialization of Body decorators.

It also uses reflect-metadata to collect metadata.

# How to use

This framework provides the following decorators: `Controller`, `Get`, `Post`, `Patch`, `Delete`, `Put`, `InjectRepository`, `Req`, `Body`, `Header`, `ExceptionFilter`, `Catch`, `BeforeCatch`, `AfterCatch`, `Injectable`, `Session`, `Transactional`, `TransactionalZone`, `InjectQueryRunner`, `UseGuard`, `View`, `Render` decorators.

-   [Controller](https://github.com/biud436/stingerloom#controller)
-   [Injectable](https://github.com/biud436/stingerloom#injectable)
-   [Exception Filter와 실행 컨텍스트](https://github.com/biud436/stingerloom#exception-filter%EC%99%80-%EC%8B%A4%ED%96%89-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8)
-   [트랜잭션의 처리](https://github.com/biud436/stingerloom#handling-database-transactions)
-   [인증](https://github.com/biud436/stingerloom#authorization)
-   [Custom Parameter Decorator](https://github.com/biud436/stingerloom#custom-parameter-decorator)
-   [템플릿 엔진](https://github.com/biud436/stingerloom#template-engine)

## Controller

A controller is a class that processes and responds to requests sent by clients.

<p align="center">
<img src="https://github.com/biud436/stingerloom/assets/13586185/366498a8-c871-400f-8ca4-4742a9e5110d" />
</p>

The `@Controller` decorator collects metadata for directing HTTP requests to controllers along a specific path and allows you to form a proper routing map.

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

StingerLoom takes care of the routing maps for you, so you don't have to write them like you used to.

The `@Body()` decorator shown in the code above deserializes the body of the request, assigns it to `createUserDto`, and performs validation. Normally, if the validation fails, a 400 error will be thrown.

You can inject an instance of FastifyRequest by attaching the `@Req()` decorator.

In addition, the `@Header()` decorator sets the response headers. You can only attach this decorator to methods, and if you omit it, the `Content-Type: application/json` header is set by default.

One thing to watch out for is the constructor part.

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

As will be explained in the `@Injectable` chapter, the `Point` class below is not managed in a container because it does not have the `@Injectable` decorator attached to it. It is not per-request, and a new instance is created for each controller or `Injectable` class that is injected.

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

So if you call `/user/point` back-to-back, you'll get the following output.

```json
{"x":5,"y":5}
{"x":10,"y":10}
```

In contrast, an `Injectable` class is managed as a singleton instance, so the same instance is injected each time it is injected into a controller or an `Injectable` class, rather than per request.

For an example of this, see the next section, [Injectable](https://github.com/biud436/stingerloom#injectable).

[▲ Back to Table of Contents](https://github.com/biud436/stingerloom#how-to-use)

## Injectable

A class marked with the `@Injectable` decorator can be injected into the constructor of another class. It will also analyze the type of the constructor parameters and turn the instance into a singleton instance managed by a server container that creates only one instance.

However, if the `@Injectable` decorator is not marked, the class is simply instantiated each time via the default constructor and is not managed by the server container.

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

[▲ Back to Table of Contents](https://github.com/biud436/stingerloom#how-to-use)

## Exception Filter and Execution Context

An Exception Filter is a decorator that allows you to handle and override errors. You attach the `@ExceptionFilter` decorator and specify an error class as the decorator's argument. Then, when an error occurs that corresponds to that error class, the method with the `@Catch` decorator is executed. Methods with the `@BeforeCatch` decorator are executed before the method with the `@Catch` decorator is executed, and methods with the `@AfterCatch` decorator are executed after the method with the `@Catch` decorator is executed.

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

This will produce the output shown below.

<p align="center">
<img src="https://github.com/biud436/custom-server-framework/assets/13586185/998fe1e3-f705-4a9c-a453-7179f42fc770" />
</p>

Exception methods are executed in the order `@BeforeCatch -> @Catch -> @AfterCatch`. Each exception context is a shared instance, with one instance per exception-handling class.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#how-to-use)

## Handling Database Transactions

트랜잭션은 작업의 완전성과 데이터의 정합성을 보장하기 위한 기능입니다. 즉, 어떤 작업을 완벽하게 처리하지 못했을 때 원 상태로 복구할 수 있도록 해주는 기능입니다.

StingerLoom에서는 이러한 트랜잭션 처리를 위해서 `@Transactional`이라는 데코레이터를 지원합니다.

스프링에서 영감을 받은 이 데코레이터의 트랜잭션 격리 수준은 생략 시 `REPETABLE READ`가 기본값입니다.

트랜잭션 격리 수준이란 여러 트랜잭션이 동시에 처리될 때, 특정 트랜잭션이 다른 트랜잭션의 변경 사항을 볼 수 있는 수준을 말합니다.

크게 4가지로 나뉘는데, `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`이 있습니다.

`@Transactional` 기능은 현재 `@Injectable` 데코레이터가 붙은 클래스에만 적용됩니다.

또한 트랜잭션 처리를 위해서는 효율적인 검색을 위해 `@TransactionalZone` 데코레이터를 클래스에 마킹하여야 합니다.

`@TransactionalZone` 데코레이터는 트랜잭션 처리를 위한 `EntityManager`과 `QueryRunner`를 주입받을 메소드를 찾아서 트랜잭션 처리를 수행합니다.

다음은 트랜잭션을 처리하는 심플한 예시입니다.

### Transaction Entity Manager를 사용하는 경우

`transactionalEntityManager` 속성을 `true`로 설정하면, `Transaction Entity Manager`를 자동으로 주입받을 수 있습니다.

`Transaction Entity Manager`를 사용하면 트랜잭션 엔티티 매니저를 사용하여 단일이 아닌 여러 쿼리를 트랜잭션으로 처리를 할 수 있게 됩니다.

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
}
```

위 코드를 보면 주입 받은 트랜잭션 엔티티 매니저의 인스턴스인 `em`을 사용해야 트랜잭션으로 처리가 됩니다.

### `QueryRunner`를 사용하는 경우 (추천)

제가 자주 사용하는 방법인데요. 바로 `QueryRunner`를 사용하는 방법이 있습니다.

`QueryRunner`를 사용하는 경우, 트랜잭션을 상세하게 제어할 수 있는데, `@Transactional()`이라고 표시된 메소드는 자동으로 `QueryRunner`를 주입받습니다.

또한 오류가 발생하면 자동으로 롤백 처리까지 해줍니다.

처음에 이것을 설계할 때 `QueryRunner`가 인터페이스라서 `QueryRunner`를 주입받는 것이 불가능하다고 생각했었는데요.

이는 `@InjectQueryRunner()`를 통해 해결할 수 있었습니다.

따라서 QueryRunner 인스턴스를 제대로 주입받으려면 `@InjectQueryRunner()` 데코레이터를 사용해야 합니다.

그럼 예제를 볼까요?

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

예제를 보면 굉장히 심플하다는 것을 알 수 있습니다. 반환까지 오류가 발생하지 않으면 트랜잭션이 정상적으로 커밋됩니다.

`QueryRunner`는 `@InjectQueryRunner()` 데코레이터를 통해 주입받을 수 있습니다.

다음은 또 다른 예제인 회원 가입 예제입니다.

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

        return ResultUtils.success("유저 생성에 성공하였습니다.", res);
    }

    // Skip...
}
```

중간에 오류 처리 로직이 보이실 겁니다. 심플하게 생각할 수 있는데요. 위 코드에서 오류가 throw되면 자동으로 트랜잭션이 롤백 처리됩니다.

대신, 트랜잭션이 필요한 부분은 주입되는 `queryRunner`를 통해 처리해야 합니다.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#how-to-use)

## Authorization

StingerLoom에선 세션 기반 인증을 지원합니다.

SessionObject를 상속받은 클래스를 세션 오브젝트로 사용할 수 있습니다.

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
}
```

아직 예제에 인가 처리가 구현되지 않았는데요.

인가 처리는 인증 가드(AuthGuard) 개념과 인가 처리에 필요한 Role 개념을 구현해야 합니다.

### Handling Session

조금 더 실용적인 예제는 아래와 같습니다.

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

### Session Guard

세션 인증은 `@Session()` 데코레이터를 사용하여 세션 오브젝트를 주입받아서 처리할 수 있고, SessionGuard를 추가하여 세션 인증을 처리할 수 있습니다.

코드는 다음과 같습니다.

```ts
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
```

위 가드를 providers에 추가하고 아래와 같이 컨트롤러나 라우터에 붙여서 사용할 수 있습니다.

```ts
@Controller("/auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get("/session-guard")
    @UseGuard(SessionGuard)
    async checkSessionGuard(@Session() session: SessionObject) {
        return ResultUtils.success("세션 가드 통과", session);
    }
}
```

위와 같이 하면 세션 인증을 통과한 로그인 사용자의 경우에만 라우터가 실행됩니다.

인증이 되지 않은 사용자의 경우에는 401 오류가 발생합니다.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#how-to-use)

## Custom Parameter Decorator

`createCustomParamDecorator` 함수를 이용하여 자신만의 `ParameterDecorator`를 만들 수 있습니다.

다음은 유저 정보와 유저 ID를 세션으로부터 취득하는 예제입니다.

```ts
export const User = createCustomParamDecorator((data, context) => {
    const req = context.req;
    const session = req.session as SessionObject;

    if (!session) {
        return null;
    }

    return session.user;
});
```

유저 ID는 아래와 같이 취득할 수 있습니다.

```ts
export const UserId = createCustomParamDecorator((data, context) => {
    const req = context.req;
    const session = req.session as SessionObject;

    if (!session) {
        return null;
    }

    return session.user.id;
});
```

최종 사용법은 아래와 같습니다.

```ts
@Controller("/auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get("/session-guard")
    @UseGuard(SessionGuard)
    async checkSessionGuard(
        @Session() session: SessionObject,
        @User() user: any,
        @UserId() userId: string,
    ) {
        return ResultUtils.success("세션 가드 통과", {
            user,
            userId,
        });
    }
}
```

조회하면 결과는 아래와 같이 출력됩니다.

```json
{
    "message": "세션 가드 통과",
    "result": "success",
    "data": {
        "user": {
            "id": "4500949a-3855-42d4-a4d0-a7f0e81c4054",
            "username": "abcd",
            "role": "user",
            "createdAt": "2023-08-28T09:22:37.144Z",
            "updatedAt": "2023-08-28T09:22:37.144Z"
        },
        "userId": "4500949a-3855-42d4-a4d0-a7f0e81c4054"
    }
}
```

## Template Engine

템플릿 엔진은 `@View` 데코레이터를 사용하여 HTML 파일을 렌더링할 수 있습니다.

먼저 필요한 패키지를 설치해야 합니다. 터미널에서 다음과 같이 입력합니다.

```bash
yarn add @fastify/view handlebars
```

`bootstrap.ts` 파일에서 템플릿 엔진을 미들웨어로 등록하면 모든 컨트롤러에서 템플릿 엔진을 사용할 수 있습니다.

```ts
    /**
     * 미들웨어를 추가합니다.
     *
     * @returns
     */
    protected applyMiddlewares(): this {
        const app = this.app;

        app.register(fastifyCookie, {
            secret: process.env.COOKIE_SECRET,
            hook: "onRequest",
        });

        app.register(fastifyFormdody);
        app.register(fastifySession, {
            secret: process.env.SESSION_SECRET,
        });

        app.register(view, {
            engine: {
                handlebars,
            },
            root: `${__dirname}/views`,
            includeViewExtension: true,
        });

        return this;
    }
```

컨트롤러에서는 `@View` 데코레이터를 사용하면 템플릿과 매핑할 수 있습니다.

```ts
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
```

만약 뷰의 경로와 라우트의 경로가 다르다면 다음과 같이 `@Render` 데코레이터를 사용하여 템플릿 리소스의 경로를 지정할 수 있습니다.

```ts
@Controller("/")
export class AppController {
    /**
     * 로그인된 유저만 접근할 수 있는 페이지입니다.
     */
    @Get("/info")
    @Render("memberInfo")
    @UseGuard(SessionGuard)
    async memberInfo(@User() user: UserEntity) {
        return {
            username: user.username,
        };
    }
}
```

필요한 매개변수를 반환하면 각 템플릿 엔진에서 이를 처리할 수 있습니다.

다음은 `handlebars` 템플릿 엔진을 사용한 로그인 예제입니다.

```hbs
<!-- login.hbs -->
<html lang="ko">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>템플릿 렌더링 예제</title>
    </head>
    <body>
        <div>
            <h2>로그인</h2>
            <form action="/auth/login" method="post">
                <input type="text" name="username" placeholder="{{username}}" />
                <input
                    type="password"
                    name="password"
                    placeholder="{{password}}"
                />
                <input type="submit" value="login" />
            </form>
        </div>
    </body>
</html>
```

세션 정보를 표시하는 예제입니다.

```hbs
<!-- memberInfo.hbs -->
<html lang="ko">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>세션 예제</title>
    </head>
    <body>
        <p>로그인한 유저 정보는 <strong>{{username}}</strong>입니다.</p>
    </body>
</html>
```

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#how-to-use)

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
