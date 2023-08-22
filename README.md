# Introduction

This is a node server framework made from scratch for study purposes.

## 사용한 기술

-   fastify
-   typeorm
-   typedi
-   reflect-metadata
-   mariadb
-   class-transformer
-   class-validator

## 사용법

이 프레임워크는 `Controller`, `Get`, `Post`, `Patch`, `Delete`, `Put`, `InjectRepository`, `Req`, `Body`, `Header`, `ExceptionFilter`, `Catch`, `BeforeCatch`, `AfterCatch` 데코레이터를 지원합니다.

### Controller

Controller는 다음과 같이 정의할 수 있습니다. 상단에 `@Controller` 데코레이터를 붙이고 데코레이터의 인자로는 해당 컨트롤러의 기본 경로를 지정합니다. 이후에는 해당 컨트롤러의 메소드를 정의하면 됩니다.

```ts
@Controller("/user")
export class UserController {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    @Header("Content-Type", "application/json")
    @Get()
    public async getUser(@Req() req: FastifyRequest) {
        const user = await this.userRepository.find();
        return {
            user,
            ip: req.ip,
        };
    }

    @Post()
    public async create(@Body() createUserDto: CreateUserDto) {
        const newUser = await this.userRepository.create(createUserDto);
        return await this.userRepository.save(newUser);
    }
}
```

### Exception Filter

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

### 제한 사항

현재 버전에서는 컨트롤러 데코레이터가 마킹된 클래스에서만 생성자에 매개변수 주입이 가능하며, 서비스 레이어에서는 매개변수 주입이 아직 불가능합니다.

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
