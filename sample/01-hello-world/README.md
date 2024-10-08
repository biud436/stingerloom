# 소개

예제 프로젝트는 StingerLoom 프레임워크를 사용하여 간단한 웹 서버를 구축하는 방법을 보여줍니다.

## 설치 및 실행 방법

1. Node.js와 npm이 설치되어 있는지 확인합니다.
2. 터미널을 열고 프로젝트 루트 디렉토리로 이동합니다.
3. 다음 명령어를 실행하여 프로젝트에 필요한 패키지를 설치합니다:

   ```sh
   npm install
   ```

   또는

   ```sh
   yarn install
   ```

4. 다음 명령어를 실행하여 프로젝트를 시작합니다:

   ```sh
   npm run start:dev
   ```

   또는

   ```sh
   yarn start:dev
   ```

## docker-compose.yml 실행 방법

1. Docker와 Docker Compose가 설치되어 있는지 확인합니다.
2. 터미널을 열고 `docker-compose.yml` 파일이 있는 디렉토리로 이동합니다.
3. 다음 명령어를 실행하여 Docker Compose를 시작합니다:

   ```sh
   docker-compose up -d
   ```

## .env 파일 작성 방법

1. 프로젝트 루트 디렉토리에 `.env.example` 파일을 참조하여 `.env` 파일을 생성합니다.
2. 환경 변수와 그 값을 다음과 같은 형식으로 작성합니다:

   ```env
   VARIABLE_NAME=value
   ```

   예를 들어:

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
