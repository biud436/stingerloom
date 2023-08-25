# Introduction

이 서버 프레임워크는 Nest.js라는 서버 프레임워크의 동작 원리와 기술을 더 깊이 이해하기 위해서 그리고 `나만의 서버 프레임워크를 만들어보자`라는 취지로 개발을 시작하였습니다.

`나만의 서버 프레임워크`의 이름은 StingerLoom이며 라우터 맵핑 기능과 StingerLoom Container에 의한 DI와 데이터베이스 접근에 필요한 ORM 등의 기능을 지원합니다.

## 개발 일지

이 프레임워크를 만들면서 제가 고민했던 내용들을 아래 링크에 정리해두었습니다.

-   [나만의 Node.js 서버 프레임워크 개발기 2편](https://blog.naver.com/biud436/223192980484)
-   [나만의 Node.js 서버 프레임워크 개발기 1편](https://blog.naver.com/biud436/223163267550)

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

# 사용법

이 프레임워크는 `Controller`, `Get`, `Post`, `Patch`, `Delete`, `Put`, `InjectRepository`, `Req`, `Body`, `Header`, `ExceptionFilter`, `Catch`, `BeforeCatch`, `AfterCatch`, `Injectable` 데코레이터를 지원합니다.

## Controller

컨트롤러는 클라이언트가 보내는 요청을 처리하고 응답하는 클래스입니다.

`@Controller` 데코레이터는 HTTP 요청을 특정 경로에 해당하는 컨트롤러로 보내기 위한 메타데이터를 수집하며, 알맞은 라우팅 맵을 형성할 수 있도록 해줍니다.

```ts
@Controller("/user")
export class UserController {
    constructor(
        // Point는 injectable한 클래스가 아니므로 매번 인스턴스화됩니다.
        private readonly point: Point,
        // UserService는 injectable한 클래스이므로 싱글톤 인스턴스로 관리됩니다.
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
        const newUser = await this.userRepository.create(createUserDto);
        return await this.userRepository.save(newUser);
    }

    async getUser(ip: string) {
        const user = await this.userRepository.find();
        return {
            user,
            ip,
        };
    }
}
```

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

![image](https://github.com/biud436/custom-server-framework/assets/13586185/998fe1e3-f705-4a9c-a453-7179f42fc770)

예외 메소드는 `@BeforeCatch -> @Catch -> @AfterCatch` 순으로 실행됩니다. 각 예외 컨텍스트는 예외 처리 클래스 당 하나의 인스턴스를 공유하는 공유 인스턴스입니다.

## Usage

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
