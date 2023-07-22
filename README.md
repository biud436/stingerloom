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

이 프레임워크는 `Controller`, `Get`, `Post`, `Patch`, `Delete`, `Put`, `InjectRepository`, `Req`, `Body` 데코레이터를 지원합니다.

### 기본 형태

```ts
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Repository } from "typeorm";
import { User } from "../entity/User";
import { Controller } from "../lib/Controller";
import { Get } from "../lib/Get";
import { InjectRepository } from "../lib/InjectRepository";
import { Req } from "../lib/Req";
import { FastifyRequest } from "fastify";
import { Post } from "../lib/Post";
import { Body } from "../lib/Body";
import { CreateUserDto } from "./dto/CreateUserDto";

@Controller("/user")
export class UserController {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

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

단, 컨트롤러 데코레이터를 정상적으로 읽기 위해서는 imports 배열에 의존성을 추가해줘야 합니다.

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
