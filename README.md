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
```

and then next you can start this application with this command.

```bash
yarn start
```
