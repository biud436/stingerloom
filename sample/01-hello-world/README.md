# Introduction

This sample project demonstrates how to build a simple web server using the StingerLoom framework.

## Installation and Setup

1. Ensure that Node.js and npm are installed.
2. Open a terminal and navigate to the project root directory.
3. Run the following command to install the required dependencies:

   ```sh
   npm install
   ```

   or

   ```sh
   yarn install
   ```

4. Run the following command to launch the project:

   ```sh
   npm run start:dev
   ```

   or

   ```sh
   yarn start:dev
   ```

## Running docker-compose.yml

1. Ensure that Docker and Docker Compose are installed.
2. Open a terminal and navigate to the directory containing the `docker-compose.yml` file.
3. Run the following command to start Docker Compose:

   ```sh
   docker compose up -d
   ```

## Creating the .env File

1. In the project root directory, create a `.env` file by referring to the `.env.example` file.
2. Define the environment variables and their values in the following format:

   ```env
   VARIABLE_NAME=value
   ```

   For example:

   ```env
    SERVER_PORT=3002
    DB_HOST=localhost
    DB_PORT=3306
    DB_NAME=test
    DB_USER=root
    DB_PASSWORD=test1234
    SESSION_SECRET=1234567890
    COOKIE_SECRET=1234567890
   ```
