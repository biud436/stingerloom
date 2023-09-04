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
-   [Exception Filter and Execution Context](https://github.com/biud436/stingerloom#exception-filter-and-execution-context)
-   [Processing of transactions](https://github.com/biud436/stingerloom#handling-database-transactions)
-   [Authorization](https://github.com/biud436/stingerloom#authorization)
-   [Custom Parameter Decorator](https://github.com/biud436/stingerloom#custom-parameter-decorator)
-   [Template Engine](https://github.com/biud436/stingerloom#template-engine)

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

[▲ Back to Table of Contents](https://github.com/biud436/stingerloom#how-to-use)

## Handling Database Transactions

Transactions are a feature to ensure the completeness of operations and the consistency of data. In other words, they allow you to restore the original state when something doesn't work perfectly.

To handle these transactions, StingerLoom supports a decorator called `@Transactional`.

This Spring-inspired decorator's transaction isolation level defaults to REPETABLE READ when omitted.

Transaction isolation level refers to the level at which a particular transaction can see changes made by other transactions when multiple transactions are being processed at the same time.

There are four main types: `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, and `SERIALIZABLE`.

The `@Transactional` feature currently only applies to classes with the @Injectable decorator.

Also, for transactional processing, classes must be marked with the @TransactionalZone decorator for efficient search.

The `@TransactionalZone` decorator performs transaction processing by finding methods to inject EntityManager and QueryRunner for transaction processing.

Here's a simple example of how to handle transactions.

### If you are using Transaction Entity Manager

If you set the `transactionalEntityManager` property to `true`, you can have the `Transaction Entity Manager` automatically injected.

With `Transactional Entity Manager`, you will be able to process multiple queries as a transaction instead of a single one using the Transactional Entity Manager.

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

In the code above, you can see that we need to use `em`, which is an instance of the injected transaction entity manager, to be treated as a transaction.

### If you use `QueryRunner` (recommended)

My favorite way to do this is to use a `QueryRunner`.

If you use `QueryRunner`, you have a lot more control over the transaction: methods labeled `@Transactional()` are automatically injected with `QueryRunner`.

It also automatically handles rollbacks if an error occurs.

When I first designed this, I thought it was impossible to get `QueryRunner` injected because `QueryRunner` is an interface.

This was solved with `@InjectQueryRunner()`.

So, to get a QueryRunner instance injected properly, we need to use the `@InjectQueryRunner()` decorator.

So let's see an example.

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

If you look at the example, you'll see that it's pretty simple. If no errors occur on return, the transaction will commit normally.

The `QueryRunner` can be injected via the `@InjectQueryRunner()` decorator.

Here's another example, a membership signup example.

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

You'll notice the error handling logic in the middle, which can be thought of simply: if an error is thrown in the above code, the transaction is automatically rolled back.

Instead, the parts that need to be transactional should be handled by the injected `queryRunner`.

[▲ Back to Table of Contents](https://github.com/biud436/stingerloom#how-to-use)

## Authorization

StingerLoom supports session-based authentication.

Classes that inherit from SessionObject can be used as session objects.

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

Authorization processing is not yet implemented in the example.

Authorization processing requires the implementation of the AuthGuard concept and the Role concept, which is required for authorization processing.

### Handling Session

Here's a more practical example.

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

In the current version, you can implement authentication using session objects as shown above.

### Session Guard

Session authentication can be handled by injecting a session object using the `@Session()` decorator and adding a SessionGuard to handle session authentication.

The code looks like this.

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

You can add the above guard to your providers and attach it to your controller or router as shown below.

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

The above will only run the router for login users who have passed session authentication.

For unauthenticated users, a 401 error will occur.

[▲ Back to Table of Contents](https://github.com/biud436/stingerloom#how-to-use)

## Custom Parameter Decorator

You can create your own `ParameterDecorator` using the `createCustomParamDecorator` function.

Here is an example of getting user information and a user ID from a session.

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

You can get a user ID as follows.

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

Here's how I ended up using it

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

When queried, the result is output as shown below.

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

The template engine can render HTML files using the `@View` decorator.

First, you need to install the necessary packages. In a terminal, type

```bash
yarn add @fastify/view handlebars
```

In the `bootstrap.ts` file, register the template engine as middleware so that all controllers can use it.

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

In the controller, you can use the `@View` decorator to map with templates.

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

If the path in the view is different from the path in the route, you can use the `@Render` decorator to specify the path to the template resource, like this

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

Return the required parameters and each template engine can process them.

Here's an example of a login using the `handlebars` template engine.

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

Example of displaying session information.

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

[▲ Back to Table of Contents](https://github.com/biud436/stingerloom#how-to-use)

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

## Generate a new controller and service

StingerLoom supports interactive prompts. The interactive prompts make it easy to create module files. However, at this stage, you can only create variables in the template file, but I think you should add logic to read the module information using the Typescript compiler through further research.

<p align="center">
<img src="https://github.com/biud436/stingerloom/assets/13586185/661719f1-38ba-4823-9458-3d8c017ebb82" />
</p>

to generate a new controller and service automatically, you can use the following command.

```bash
yarn gen
```
