# Introduction

This application is a simple application to show some data for testing purpose.

## Installation

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

## Usage

`Controller` 데코레이터와 `Get` 데코레이터를 이용하여 간단하게 컨트롤러를 만들 수 있다.

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

컨트롤러를 만든 후, imports 변수에 추가해줘야 한다.
직접 프레임워크를 만들어보니, 왜 Nest.js에서 imports 배열이 필요한 지 알게 된 듯 하다.
