# Introduction

공부 용도로 직접 바닥부터 만들어본 노드 서버 프레임워크입니다. 

## 설치 방법

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


## 사용한 기술

- fastify
- typeorm
- typedi
- reflect-metadata


## 사용법

`Controller` 데코레이터와 `Get` 데코레이터를 이용하여 간단하게 컨트롤러를 만들 수 있습니다.

```ts
@Controller("/post")
export class PostController {
    @Get()
    public async getPost() {
        return "post 입니다.";
    }

    @Get("/wow")
    public async getWow() {
        return "wow";
    }
}
```

컨트롤러를 만든 후, imports 변수에 추가해줘야 합니다.

직접 프레임워크를 만들어보니 왜 Nest.js에서 모듈의 `controllers` 배열에 컨트롤러 클래스를 추가해줬는지 이해할 수 있었습니다.
