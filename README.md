# Introduction

이 서버 프레임워크는 Nest.js라는 서버 프레임워크의 동작 원리와 기술을 더 깊이 이해하기 위해서 시작되었습니다.

`나만의 서버 프레임워크`를 만들어보면서 프레임워크에 대한 이해도를 높이고, Nest.js의 동작 원리를 이해하고자 하였습니다.

`나만의 서버 프레임워크`의 이름은 StingerLoom이며 라우터 맵핑 기능과 StingerLoom Container에 의한 DI와 데이터베이스 접근에 필요한 ORM 등의 기능을 지원합니다.

<p align="center"> 
<img src="https://github.com/biud436/stingerloom/assets/13586185/44f8f16a-d4b0-4beb-bb8c-78128da6265f" />
<span>▲ 로깅 화면 </span>
<img src="https://github.com/biud436/stingerloom/assets/13586185/67bd938e-d882-4119-9912-9a62b56c73a4" />
<span>▲ Typescript Compiler를 이용한 Auto Import 및 Module 의존성 자동 추가 </span>
</p>

## 개발 일지

이 프레임워크를 만들면서 제가 고민했던 내용들을 아래 링크에 정리해두었습니다.

-   [나만의 Node.js 서버 프레임워크 개발기 3편](https://blog.naver.com/biud436/223198108682)
-   [나만의 Node.js 서버 프레임워크 개발기 2편](https://blog.naver.com/biud436/223192980484)
-   [나만의 Node.js 서버 프레임워크 개발기 1편](https://blog.naver.com/biud436/223163267550)

Fastify나 Express에 종속성 없는 설계, Redis, Cache, OpenAPI (Swagger) 등 다양한 기능을 지원하기 위해서는 아직도 많은 고민이 필요합니다.

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

이 프레임워크는 `Controller`, `Get`, `Post`, `Patch`, `Delete`, `Put`, `InjectRepository`, `Req`, `Body`, `Header`, `ExceptionFilter`, `Catch`, `BeforeCatch`, `AfterCatch`, `Injectable`, `Session`, `Transactional`, `TransactionalZone`, `InjectQueryRunner`, `UseGuard`, `View`, `Render`, `Autowired`,`BeforeTransaction`, `AfterTransaction`,`Commit`,`Rollback` 데코레이터를 지원합니다.

-   [Controller](https://github.com/biud436/stingerloom#controller)
-   [Injectable](https://github.com/biud436/stingerloom#injectable)
-   [Exception Filter와 실행 컨텍스트](https://github.com/biud436/stingerloom#exception-filter%EC%99%80-%EC%8B%A4%ED%96%89-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8)
-   [트랜잭션의 처리](https://github.com/biud436/stingerloom#handling-database-transactions)
-   [인증](https://github.com/biud436/stingerloom#authorization)
-   [Custom Parameter Decorator](https://github.com/biud436/stingerloom#custom-parameter-decorator)
-   [템플릿 엔진](https://github.com/biud436/stingerloom#template-engine)

## Controller

컨트롤러는 클라이언트가 보내는 요청을 처리하고 응답하는 클래스입니다.

<p align="center">
<img src="https://github.com/biud436/stingerloom/assets/13586185/366498a8-c871-400f-8ca4-4742a9e5110d" />
</p>

`@Controller` 데코레이터는 HTTP 요청을 특정 경로에 해당하는 컨트롤러로 보내기 위한 메타데이터를 수집하며 알맞은 라우팅 맵을 형성할 수 있도록 해줍니다.

```ts
@Controller("/user")
export class UserController {
    @Autowired()
    private readonly point: Point;

    @Autowired()
    private readonly userService!: UserService;

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

`@Injectable` 데코레이터가 붙은 클래스는 다른 클래스의 생성자 또는 속성에 주입될 수 있습니다. 또한 생성자 매개변수 또는 속성의 타입을 분석하여 인스턴스를 오직 하나만 생성하는 서버 컨테이너에서 관리하는 싱글톤 인스턴스로 만들어줍니다.

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

기본적으로 생성자 기반 주입을 권장하지만 원한다면 프로퍼티(Property) 기반 주입을 사용할 수도 있습니다.

```ts
@Injectable()
export class UserService {
    @Autowired()
    private readonly discoveryService!: DiscoveryService;
}
```

다만, Property 기반 주입은 생성자 기반 주입보다 늦게 주입되므로 생성자 기반 주입을 권장합니다.

또한 `@InjectRepository`의 경우, 현재 생성자에서만 주입되므로 프로퍼티 기반 주입을 사용할 땐 주의를 요합니다.

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

`QueryRunner`를 사용하는 경우, 트랜잭션을 상세하게 제어할 수 있는데, `@Transactional()`이라고 표시된 메소드는 AOP를 통해 자동으로 트랜잭션 범위 내의 코드를 처리합니다.

또한 오류가 발생하면 자동으로 롤백 처리까지 해줍니다.

```ts
@TransactionalZone()
@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService) {}

    @Transactional()
    async checkTransaction2() {
        const users = await this.userService.findAll();

        return ResultUtils.success("트랜잭션을 확인하였습니다.", {
            users: plainToClass(User, users),
        });
    }

    @BeforeTransaction()
    async beforeTransaction(txId: string) {
        // 트랜잭션이 시작되기 전에 아래 코드가 실행됩니다.
    }

    @AfterTransaction()
    async afterTransaction(txId: string) {
        // 트랜잭션이 종료된 후에 아래 코드가 실행됩니다.
    }

    @Commit()
    async commit(txId: string) {
        // 트랜잭션이 커밋된 후에 아래 코드가 실행됩니다.
    }

    @Rollback()
    async rollback(txId: string, error: any) {
        // 트랜잭션이 롤백된 후에 아래 코드가 실행됩니다.
        // 이 메소드는 오류가 발생했을 때만 실행됩니다.
    }
}
```

예제를 보면 굉장히 심플하다는 것을 알 수 있습니다. 반환까지 오류가 발생하지 않으면 트랜잭션이 정상적으로 커밋됩니다.

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
    async create(createUserDto: CreateUserDto) {
        const safedUserDto = createUserDto as Record<string, any>;
        if (safedUserDto.role) {
            throw new BadRequestException("role 속성은 입력할 수 없습니다.");
        }

        const newUser = this.userRepository.create(createUserDto);

        const res = await this.userRepository.save(newUser, {
            transaction: false,
        });

        return ResultUtils.success("유저 생성에 성공하였습니다.", res);
    }
    // Skip...
}
```

중간에 오류 처리 로직이 보이실 겁니다. 심플하게 생각할 수 있는데요. 위 코드에서 오류가 throw되면 자동으로 트랜잭션이 롤백 처리됩니다.

만약, 롤백 처리 후에 특정 코드를 실행하고싶다면 다음과 같이 할 수 있습니다.

```ts
    @Rollback()
    async rollback(txId: string, error: any) {
        // 트랜잭션이 롤백된 후에 아래 코드가 실행됩니다.
        // 이 메소드는 오류가 발생했을 때만 실행됩니다.
    }
```

`@Rollback()` 데코레이터를 붙이고 메소드의 첫 번째 인자로는 트랜잭션 ID가, 두 번째 인자로는 오류 객체가 전달됩니다.

트랜잭션 ID는 실제 트랜잭션의 ID가 아니며 서버에서 관리하는 트랜잭션 ID입니다.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

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
    @Autowired()
    userService!: UserService;

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

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

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
ROOT_PATH=<your_root_path>
```

and then next you can start this application with this command.

```bash
yarn start
```

## Cli

StingerLoom supports interactive prompts. The interactive prompts make it easy to create module files. It's pretty limited at this point, I think you should add logic to read the module information using the Typescript compiler through further research.

<p align="center">
<img src="https://github.com/biud436/stingerloom/assets/13586185/67bd938e-d882-4119-9912-9a62b56c73a4" />
</p>

to generate a new controller and service automatically, you can use the following command.

```bash
yarn cli
```
