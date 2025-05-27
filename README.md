# Introduction

**Stingerloom**은 Node.js를 위한 서버 프레임워크로, 기존 프레임워크의 구조와 동작 원리를 스스로 구현해보며 학습하고자 하는 목적에서 출발한 프로젝트입니다.

단순한 학습을 넘어, **실제로 운영 환경에서 사용할 수 있을 수준의 완성도**를 목표로 개발되고 있습니다.

## 개발 동기

> “내가 만들 수 없는 기술을, 과연 진정으로 이해했다고 할 수 있을까?”

NestJS처럼 널리 쓰이는 프레임워크는 매우 편리하지만, 내부의 작동 원리를 완전히 이해하고 있다고 말할 수 있을까요?

**Stingerloom**은 이러한 질문에서 출발했습니다.

블랙박스처럼 동작하는 기존 프레임워크의 구조와 원리를 직접 구현해보며, **프레임워크의 본질을 이해하고, 실전에서 사용할 수 있는 수준의 서버 프레임워크**를 만드는 것을 목표로 합니다.

기존 프레임워크를 모방하는 데 그치지 않고, 핵심 원리를 직접 구현하면서도 **실전 투입이 가능한 품질과 구조**를 갖추는 것을 지향합니다.

## 지향하는 가치

- 단순 구현이 아닌 **본질의 이해**
- 단순 학습이 아닌 **실사용 수준의 완성도**
- "되는 것"이 아닌, **왜 그렇게 되는가**에 집중

---

# 사용법

사용법은 위키로 이관될 예정입니다.

## Get Started

To generate a new project, you can use the following command:

```bash
npx create-stingerloom@latest --name <my-app>
```

and then you can run the following command to install the dependencies:

```bash
cd <my-app>
yarn install
```

to start the server, you can run the following command:

```bash
yarn start:dev
```

# Overview

1. Key Features
   - [Controller](https://github.com/biud436/stingerloom?tab=readme-ov-file#controller)
   - [Injectable](https://github.com/biud436/stingerloom?tab=readme-ov-file#injectable)
   - [Exception Handling](https://github.com/biud436/stingerloom#exception-filter%EC%99%80-%EC%8B%A4%ED%96%89-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8)
   - [Transaction](https://github.com/biud436/stingerloom?tab=readme-ov-file#handling-database-transactions)
   - [Template Engine](https://github.com/biud436/stingerloom?tab=readme-ov-file#template-engine)
   - [ORM](https://github.com/biud436/stingerloom?tab=readme-ov-file#orm)
   - [Automatic File Generation](https://github.com/biud436/stingerloom?tab=readme-ov-file#cli)
2. [Authentication and Authorization](https://github.com/biud436/stingerloom?tab=readme-ov-file#authorization)
   - [Session](https://github.com/biud436/stingerloom?tab=readme-ov-file#handling-session)
   - [Session Guard](https://github.com/biud436/stingerloom?tab=readme-ov-file#session-guard)
   - [Custom Parameter Decorator](https://github.com/biud436/stingerloom?tab=readme-ov-file#custom-parameter-decorator)
3. Supported Decorators
   - Controller
   - Get
   - Post
   - Patch
   - Delete
   - Put
   - InjectRepository
   - Req
   - Body
   - Header
   - ExceptionFilter
   - Catch
   - BeforeCatch
   - AfterCatch
   - Injectable
   - Session
   - Transactional
   - TransactionalZone
   - InjectQueryRunner
   - UseGuard
   - View
   - Render
   - Autowired
   - BeforeTransaction
   - AfterTransaction
   - Commit
   - Rollback
   - Query
   - Param
   - Ip
   - Cookie
   - Column
   - Entity
   - Index

## Technologies Used

This server framework uses the following technologies:

Additionally, since it is based on Fastify, it has a strong dependency on Fastify.

- fastify
- typeorm
- typedi
- reflect-metadata
- mariadb
- class-transformer
- class-validator
- http-status

The ORM used is typeorm, and class-transformer and class-validator are used for serialization/deserialization of the Body decorator.

Also, reflect-metadata is used for metadata collection.

# Usage

This framework supports the following decorators: `Controller`, `Get`, `Post`, `Patch`, `Delete`, `Put`, `InjectRepository`, `Req`, `Body`, `Header`, `ExceptionFilter`, `Catch`, `BeforeCatch`, `AfterCatch`, `Injectable`, `Session`, `Transactional`, `TransactionalZone`, `InjectQueryRunner`, `UseGuard`, `View`, `Render`, `Autowired`,`BeforeTransaction`, `AfterTransaction`,`Commit`,`Rollback` , `Query`, `Param`, `Ip`, `Cookie`, `Column`, `Entity`, `Index`.

- [Controller](https://github.com/biud436/stingerloom?tab=readme-ov-file#controller)
- [Injectable](https://github.com/biud436/stingerloom?tab=readme-ov-file#injectable)
- [Exception Filter and Execution Context](https://github.com/biud436/stingerloom#exception-filter%EC%99%80-%EC%8B%A4%ED%96%89-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8)
- [Handling Transactions](https://github.com/biud436/stingerloom?tab=readme-ov-file#handling-database-transactions)
- [Authorization](https://github.com/biud436/stingerloom?tab=readme-ov-file#authorization)
- [Custom Parameter Decorator](https://github.com/biud436/stingerloom?tab=readme-ov-file#custom-parameter-decorator)
- [Template Engine](https://github.com/biud436/stingerloom?tab=readme-ov-file#template-engine)

## Build and Run

Since this project is written in TypeScript, you need to enter the following command in the terminal to build it.

```bash
yarn build
```

Once the build is complete, the built files will be generated in the `dist` folder, and you can run the server with the example included using the following command:

```bash
yarn start:dev
```

You can also install this library alone without the sample project and configure the server directly.

In the future, the default development environment will be reconfigured to exclude the sample project.

## Controller

A controller is a class that handles and responds to client requests.

<p align="center">
<img src="https://github.com/biud436/stingerloom/assets/13586185/366498a8-c871-400f-8ca4-4742a9e5110d" />
</p>

The `@Controller` decorator collects metadata to route HTTP requests to the appropriate controller for a specific path.

```ts
@Controller("/user")
export class UserController {
  @Autowired()
  private readonly point: Point;

  @Autowired()
  private readonly userService!: UserService;

  @Get("/:id")
  public async getUserById(
    @Param("id|8E1527BA-2C2A-4A6F-9C32-9567A867050A") id: string,
    @Query("name") name: string,
  ) {
    if (!name) {
      throw new BadRequestException("The 'name' attribute is required.");
    }

    return await this.userService.findOneByPk(id);
  }

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
  public async getUser(@Ip() ip: string) {
    return await this.userService.getUser(ip);
  }
}
```

The routing map is handled by StingerLoom, so users do not need to manually create the routing map.

The `@Body()` decorator deserializes the request body and assigns it to `createUserDto`, performing validation. If validation fails, a 400 error is usually thrown.

The `@Req()` decorator injects an instance of FastifyRequest.

The `@Header()` decorator sets the response headers. This decorator can only be applied to methods, and if omitted, the default `Content-Type: application/json` header is set.

```ts
@Controller("/")
class AppController {
  @Get("/blog/:id/:title")
  async resolveIdAndTitle(
    @Param("id|0") id: number,
    @Param("title") title: string,
  ) {
    return { id, title };
  }

  @Get("/point/:x")
  async resolveNameAndTitle(@Param("x") point: Point) {
    return point;
  }

  @Get("/user/:id")
  async resolveUser(
    @Param("id|8E1527BA-2C2A-4A6F-9C32-9567A867050A") id: string,
  ) {
    return id;
  }

  @Get("/admin/:id")
  async resolveAdmin(@Param("id") id: string) {
    return id;
  }
}
```

In StingerLoom, the `@Param()` decorator makes it easy to retrieve path parameters and automatically casts them based on their type.

To inject a default value, use the `type|default` format as an argument to the `@Param()` decorator.

To create a custom type, define a transformation object that processes the string and returns it as a type.

```ts
class Point {
  private x: number;
  private y: number;

  constructor(args: string) {
    const [x, y] = args.split(",");

    this.x = parseInt(x, 10);
    this.y = parseInt(y, 10);
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }
}
```

The same applies to `@Query`, where if the type is specified as `number`, the string is internally converted to a number and assigned.

```ts
@Controller("/")
class AppController {
  @Get("/blog")
  async resolveIdAndTitle(
    @Query("id") id: number,
    @Query("title") title: string,
  ) {
    return { id, title };
  }

  @Get("/point")
  async resolveNameAndTitle(@Query("point") point: Point) {
    return { x: point.getX(), y: point.getY() };
  }
}
```

One important thing to note in the StingerLoom server framework is the constructor part.

```ts
@Controller("/user")
export class UserController {
    constructor(
        // 1. Point is not an injectable class, so it is instantiated every time.
        private readonly point: Point,
        // 2. UserService is an injectable class, so it is managed as a singleton instance.
        private readonly userService: UserService,
    ) {}
```

As explained in the `@Injectable` chapter, the `Point` class does not have the `@Injectable` decorator, so it is not managed by the container. It is not per-request, and a new instance is created each time it is injected into a controller or an `Injectable` class.

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

Therefore, if you call `/user/point` consecutively, it will output as follows:

```json
{"x":5,"y":5}
{"x":10,"y":10}
```

On the other hand, an `Injectable` class is managed as a singleton instance, so the same instance is injected each time it is injected into a controller or an `Injectable` class.

For an example of this, refer to the next section, [Injectable](https://github.com/biud436/stingerloom#injectable).

[▲ Back to Table of Contents](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## Injectable

A class with the `@Injectable` decorator can be injected into the constructor or property of another class. It also analyzes the type of the constructor parameter or property and creates a singleton instance managed by the server container.

However, even without the `@Injectable` decorator, injection is still possible. But if the `@Injectable` decorator is not marked, the class is simply instantiated through the default constructor each time and is not managed by the server container.

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
      throw new BadRequestException("The 'role' attribute cannot be entered.");
    }

    const newUser = await this.userRepository.create(createUserDto);
    const res = await this.userRepository.save(newUser);

    return ResultUtils.success("User creation successful.", res);
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
      throw new BadRequestException("User does not exist.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException("Password does not match.");
    }

    return user;
  }

  async getUser(ip: string) {
    const user = await this.userRepository.find();
    return ResultUtils.success("User retrieval successful", {
      user,
      ip,
    });
  }
}
```

The emphasized singleton instance means that only one instance will be created. In other words, the exact same instance is injected each time it is injected into a controller or an `Injectable` class.

Constructor-based injection is recommended by default, but if desired, property-based injection can also be used.

```ts
@Injectable()
export class UserService {
  @Autowired()
  private readonly discoveryService!: DiscoveryService;
}
```

However, property-based injection is injected later than constructor-based injection, so constructor-based injection is recommended.

Also, `@InjectRepository` is currently only injected in the constructor, so be careful when using property-based injection.

[▲ Back to Table of Contents](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## Exception Filter and Execution Context

Exception Filter is a decorator that allows you to handle and redefine errors. The `@ExceptionFilter` decorator is attached, and the error class is specified as an argument to the decorator. After that, when an error corresponding to the error class occurs, the method with the `@Catch` decorator is executed.
The method with the `@BeforeCatch` decorator is executed before the method with the `@Catch` decorator is executed, and the method with the `@AfterCatch` decorator is executed after the method with the `@Catch` decorator is executed.

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
    this.logger.info("[Internal Server Error] " + error.message);

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

This will output as follows:

<p align="center">
<img src="https://github.com/biud436/custom-server-framework/assets/13586185/998fe1e3-f705-4a9c-a453-7179f42fc770" />
</p>

The exception methods are executed in the order of `@BeforeCatch -> @Catch -> @AfterCatch`. Each exception context is a shared instance that shares one instance per exception handling class.

[▲ Back to Table of Contents](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## Handling Database Transactions

Transactions are a feature that ensures the completeness and consistency of data. In other words, it is a feature that allows you to restore to the original state when a task is not processed perfectly.

StingerLoom supports the `@Transactional` decorator for handling such transactions.

Inspired by Spring, the default transaction isolation level of this decorator is `REPEATABLE READ`.

Transaction isolation level refers to the level at which a specific transaction can see the changes of other transactions when multiple transactions are processed simultaneously.

There are four main levels: `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, and `SERIALIZABLE`.

The `@Transactional` feature currently only applies to classes with the `@Injectable` decorator.

Also, for transaction processing, the `@TransactionalZone` decorator must be marked on the class for efficient search.

The `@TransactionalZone` decorator finds the methods to inject `EntityManager` and `QueryRunner` for transaction processing and performs transaction processing.

Here is a simple example of handling transactions.

```ts
@TransactionalZone()
@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  @Transactional()
  async checkTransaction2() {
    const users = await this.userService.findAll();

    return ResultUtils.success("Transaction checked.", {
      users: plainToClass(User, users),
    });
  }

  @BeforeTransaction()
  async beforeTransaction(txId: string) {
    // This code is executed before the transaction starts.
  }

  @AfterTransaction()
  async afterTransaction(txId: string) {
    // This code is executed after the transaction ends.
  }

  @Commit()
  async commit(txId: string) {
    // This code is executed after the transaction is committed.
  }

  @Rollback()
  async rollback(txId: string, error: any) {
    // This code is executed after the transaction is rolled back.
    // This method is only executed when an error occurs.
  }

  @Transactional({
    rollback: () => new Exception("Transaction rolled back", 500),
  })
  async rollbackCheck() {
    const user = await this.userService.findOneByPk("test");

    return ResultUtils.success("Rollback test", {
      user,
    });
  }
}
```

As you can see from the example, it is very simple. If no errors occur until the return, the transaction is successfully committed.

Here is another example, a user registration example.

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
  async create(createUserDto: CreateUserDto) {
    const safedUserDto = createUserDto as Record<string, any>;
    if (safedUserDto.role) {
      throw new BadRequestException("The 'role' attribute cannot be entered.");
    }

    const newUser = this.userRepository.create(createUserDto);

    const res = await this.userRepository.save(newUser);

    return ResultUtils.success("User creation successful.", res);
  }

  // Skip...
}
```

You will see an error handling logic in the middle. It can be thought of simply. If an error is thrown in the above code, the transaction is automatically rolled back.

If you want to execute specific code after the rollback, you can do it as follows.

```ts
    @Rollback()
    async rollback(txId: string, error: any) {
        // This code is executed after the transaction is rolled back.
        // This method is only executed when an error occurs.
    }
```

Attach the `@Rollback()` decorator, and the first argument of the method is the transaction ID, and the second argument is the error object.

Or, if you want to return a specific error when the transaction is rolled back, you can do it as follows.

```ts
    @Transactional({
        rollback: () => new Exception("Transaction rolled back", 500),
    })
    async rollbackCheck() {
        const user = await this.userService.findOneByPk("test");

        return ResultUtils.success("Rollback test", {
            user,
        });
    }
```

The transaction ID is not the actual transaction ID but the transaction ID managed by the server.

```ts
@Injectable()
@TransactionalZone()
export class GameMapService {
  constructor(
    @InjectRepository(GameMap)
    private readonly gameMapRepository: Repository<GameMap>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Transactional()
  async createGameMap() {
    await this.userRepository.clear();

    const qb = this.gameMapRepository.createQueryBuilder("gameMap");
    const maps = await qb
      .select()
      .leftJoinAndSelect("gameMap.users", "user")
      .getMany();

    return maps;
  }

  @Commit()
  async commitOk(txId: string) {
    console.log("Commit OK:", txId);
  }
}
```

[▲ Back to Table of Contents](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## Authorization

StingerLoom supports session-based authentication.

A class that inherits from SessionObject can be used as a session object.

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

Authorization processing requires implementing the concept of an authentication guard (AuthGuard) and the concept of roles needed for authorization processing.

### Handling Session

A more practical example is as follows.

```ts
@Injectable()
export class AuthService {
  @Autowired()
  userService!: UserService;

  async login(session: SessionObject, loginUserDto: LoginUserDto) {
    const user = await this.userService.validateUser(loginUserDto);
    session.authenticated = true;
    session.user = user;

    return ResultUtils.successWrap({
      message: "Login successful.",
      result: "success",
      data: session.user,
    });
  }

  async checkSession(session: SessionObject) {
    return ResultUtils.success("Session authentication successful", {
      authenticated: session.authenticated,
      user: session.user,
    });
  }
}
```

In the current version, you can implement authentication using the session object as shown above.

### Session Guard

Session authentication can be processed by injecting the session object using the `@Session()` decorator and adding a SessionGuard to handle session authentication.

The code is as follows.

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

Add the above guard to the providers and use it by attaching it to the controller or router as follows.

```ts
@Controller("/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("/session-guard")
  @UseGuard(SessionGuard)
  async checkSessionGuard(@Session() session: SessionObject) {
    return ResultUtils.success("Session guard passed", session);
  }
}
```

This way, the router is executed only for logged-in users who have passed session authentication.

For users who are not authenticated, a 401 error occurs.

[▲ Back to Table of Contents](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## Custom Parameter Decorator

You can create your own `ParameterDecorator` using the `createCustomParamDecorator` function.

Here is an example of retrieving user information and user ID from the session.

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

You can retrieve the user ID as follows.

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

The final usage is as follows.

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
    return ResultUtils.success("Session guard passed", {
      user,
      userId,
    });
  }
}
```

When queried, the result is output as follows.

```json
{
  "message": "Session guard passed",
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

The template engine allows you to render HTML files using the `@View` decorator.

First, you need to install the necessary packages. Enter the following command in the terminal.

```bash
yarn add @fastify/view handlebars
```

If you register the template engine as middleware in the `bootstrap.ts` file, you can use the template engine in all controllers.

```ts
    /**
     * Add middleware.
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

In the controller, you can map to the template using the `@View` decorator.

```ts
@Controller("/")
export class AppController {
  /**
   * Display the login page.
   */
  @View("login")
  login() {
    return {
      username: "Username",
      password: "Password",
    };
  }

  /**
   * This page is accessible only to logged-in users.
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

If the path of the view and the route are different, you can specify the path of the template resource using the `@Render` decorator as follows.

```ts
@Controller("/")
export class AppController {
  /**
   * This page is accessible only to logged-in users.
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

Return the necessary parameters, and each template engine can process them.

Here is a login example using the `handlebars` template engine.

```hbs
<!-- login.hbs -->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Template Rendering Example</title>
  </head>
  <body>
    <div>
      <h2>Login</h2>
      <form action="/auth/login" method="post">
        <input type="text" name="username" placeholder="{{username}}" />
        <input type="password" name="password" placeholder="{{password}}" />
        <input type="submit" value="login" />
      </form>
    </div>
  </body>
</html>
```

Here is an example of displaying session information.

```hbs
<!-- memberInfo.hbs -->
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Session Example</title>
  </head>
  <body>
    <p>The logged-in user information is <strong>{{username}}</strong>.</p>
  </body>
</html>
```

[▲ Back to Table of Contents](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## ORM

ORM is a tool that supports mapping between objects and relational databases.

StingerLoom provides its own ORM, so you can access the database without third-party libraries.

You can define an entity using the `@Entity` decorator. An entity is mapped to a table in the database. Using the synchronize option, you can synchronize the written entity with the database.

You can define an entity using the `@Column`, `@Entity`, and `@Index` provided by the `@stingerloom/orm/decorators` package.

```ts
@Entity()
class MyNode {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    length: 255,
    nullable: false,
    type: "varchar",
  })
  name!: string;

  @Column({
    length: 255,
    nullable: false,
    type: "varchar",
  })
  type!: string;

  @Column({
    length: 255,
    nullable: false,
    type: "varchar",
  })
  @Index()
  description!: string;
}
```

You can access the database through the repository. There are two ways to create a repository: using the `getRepository` method by injecting `EntityManager` and using the `@InjectRepository` decorator. The latter method is only supported in TypeORM and is not yet supported in the custom ORM. We will consider how to make it usable in both ORMs in the future.

```ts
@Injectable()
class MyNodeService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    )

    async findOne(id: number): Promise<MyNode> {

        // Get the repository for the MyNode entity
        const myNodeRepository = this.entityManager.getRepository(MyNode);

        // Find the node with id 1
        const myNode = await myNodeRepository.findOne({
            where: {
                id
            }
        });

        if (!myNode) {
            throw new NotFoundException("Node not found.");
        }

        return myNode;
    }
}
```

As shown above, you can inject `EntityManager` using the `@InjectEntityManager` decorator to get the repository.

You can access the database through the repository pattern.

[▲ Back to Table of Contents](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## Cli

StingerLoom supports interactive prompts. The interactive prompts make it easy to create module files. It's pretty limited at this point, I think you should add logic to read the module information using the Typescript compiler through further research.

<p align="center">
<img src="https://github.com/biud436/stingerloom/assets/13586185/67bd938e-d882-4119-9912-9a62b56c73a4" />
</p>

to generate a new controller and service automatically, you can use the following command.

```bash
yarn cli
```
