# 소개

**Stingerloom**은 Node.js를 위한 서버 프레임워크로, 기존 프레임워크의 구조와 동작 원리를 스스로 구현해보며 학습하고자 하는 목적에서 출발한 프로젝트입니다.

단순한 학습을 넘어, **실제로 운영 환경에서 사용할 수 있을 수준의 완성도**를 목표로 개발되고 있습니다.

## 개발 동기

> "내가 만들 수 없는 기술을, 과연 진정으로 이해했다고 할 수 있을까?"

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

## 시작하기

본 프레임워크를 이용하려면, 먼저 `@stingerloom/core` 패키지 설치를 비롯한 필요한 구성을 해야 합니다.

이는 매우 번거롭고 복잡할 수 있지만, **Stingerloom**은 이러한 번거로움을 최소화하기 위해,

CLI에서 새로운 프로젝트를 생성할 수 있는 기능을 제공합니다.

새 프로젝트를 생성하려면 다음 명령어를 사용할 수 있습니다:

```bash
npx create-stingerloom@latest --name <my-app>
```

그 다음 다음 명령어를 실행하여 의존성을 설치합니다:

```bash
cd <my-app>
yarn install
```

서버를 시작하려면 다음 명령어를 실행합니다:

```bash
yarn start:dev
```

# 개요

1. 주요 기능들
   - [컨트롤러](https://github.com/biud436/stingerloom?tab=readme-ov-file#controller)
   - [주입 가능한 클래스](https://github.com/biud436/stingerloom?tab=readme-ov-file#injectable)
   - [예외 처리](https://github.com/biud436/stingerloom#exception-filter%EC%99%80-%EC%8B%A4%ED%96%89-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8)
   - [트랜잭션](https://github.com/biud436/stingerloom?tab=readme-ov-file#handling-database-transactions)
   - [템플릿 엔진](https://github.com/biud436/stingerloom?tab=readme-ov-file#template-engine)
   - [ORM](https://github.com/biud436/stingerloom?tab=readme-ov-file#orm)
   - [자동 파일 생성](https://github.com/biud436/stingerloom?tab=readme-ov-file#cli)
2. [인증 및 권한](https://github.com/biud436/stingerloom?tab=readme-ov-file#authorization)
   - [세션](https://github.com/biud436/stingerloom?tab=readme-ov-file#handling-session)
   - [세션 가드](https://github.com/biud436/stingerloom?tab=readme-ov-file#session-guard)
   - [커스텀 매개변수 데코레이터](https://github.com/biud436/stingerloom?tab=readme-ov-file#custom-parameter-decorator)
3. 지원되는 데코레이터들
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

## 사용 기술

이 서버 프레임워크는 다음 기술들을 사용합니다:

또한 Fastify를 기반으로 하므로 Fastify에 대한 강한 의존성을 가집니다.

- fastify
- typeorm
- typedi
- reflect-metadata
- mariadb
- class-transformer
- class-validator
- http-status

사용하는 ORM은 typeorm이며, Body 데코레이터의 직렬화/역직렬화를 위해 class-transformer와 class-validator가 사용됩니다.

또한 메타데이터 수집을 위해 reflect-metadata가 사용됩니다.

# 사용법

이 프레임워크는 다음 데코레이터들을 지원합니다: `Controller`, `Get`, `Post`, `Patch`, `Delete`, `Put`, `InjectRepository`, `Req`, `Body`, `Header`, `ExceptionFilter`, `Catch`, `BeforeCatch`, `AfterCatch`, `Injectable`, `Session`, `Transactional`, `TransactionalZone`, `InjectQueryRunner`, `UseGuard`, `View`, `Render`, `Autowired`,`BeforeTransaction`, `AfterTransaction`,`Commit`,`Rollback` , `Query`, `Param`, `Ip`, `Cookie`, `Column`, `Entity`, `Index`.

- [컨트롤러](https://github.com/biud436/stingerloom?tab=readme-ov-file#controller)
- [주입 가능한 클래스](https://github.com/biud436/stingerloom?tab=readme-ov-file#injectable)
- [예외 필터와 실행 컨텍스트](https://github.com/biud436/stingerloom#exception-filter%EC%99%80-%EC%8B%A4%ED%96%89-%EC%BB%A8%ED%85%8D%EC%8A%A4%ED%8A%B8)
- [트랜잭션 처리](https://github.com/biud436/stingerloom?tab=readme-ov-file#handling-database-transactions)
- [권한 처리](https://github.com/biud436/stingerloom?tab=readme-ov-file#authorization)
- [커스텀 매개변수 데코레이터](https://github.com/biud436/stingerloom?tab=readme-ov-file#custom-parameter-decorator)
- [템플릿 엔진](https://github.com/biud436/stingerloom?tab=readme-ov-file#template-engine)

## 빌드 및 실행

이 프로젝트는 TypeScript로 작성되어 있으므로 빌드하려면 터미널에서 다음 명령어를 입력해야 합니다.

```bash
yarn build
```

빌드가 완료되면 `dist` 폴더에 빌드된 파일들이 생성되며, 포함된 예제와 함께 다음 명령어로 서버를 실행할 수 있습니다:

```bash
yarn start:dev
```

샘플 프로젝트 없이 이 라이브러리만 설치하여 직접 서버를 구성할 수도 있습니다.

향후 기본 개발 환경은 샘플 프로젝트를 제외하도록 재구성될 것입니다.

## 컨트롤러

컨트롤러는 클라이언트 요청을 처리하고 응답하는 클래스입니다.

<p align="center">
<img src="https://github.com/biud436/stingerloom/assets/13586185/366498a8-c871-400f-8ca4-4742a9e5110d" />
</p>

`@Controller` 데코레이터는 특정 경로에 대해 HTTP 요청을 적절한 컨트롤러로 라우팅하기 위한 메타데이터를 수집합니다.

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
      throw new BadRequestException("'name' 속성이 필요합니다.");
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

라우팅 맵은 StingerLoom에서 처리하므로 사용자가 수동으로 라우팅 맵을 생성할 필요가 없습니다.

`@Body()` 데코레이터는 요청 본문을 역직렬화하여 `createUserDto`에 할당하며 유효성 검사를 수행합니다. 유효성 검사가 실패하면 보통 400 오류가 발생합니다.

`@Req()` 데코레이터는 FastifyRequest의 인스턴스를 주입합니다.

`@Header()` 데코레이터는 응답 헤더를 설정합니다. 이 데코레이터는 메소드에만 적용할 수 있으며, 생략하면 기본 `Content-Type: application/json` 헤더가 설정됩니다.

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

StingerLoom에서는 `@Param()` 데코레이터를 통해 경로 매개변수를 쉽게 가져올 수 있으며 타입에 따라 자동으로 캐스팅됩니다.

기본값을 주입하려면 `@Param()` 데코레이터의 인수로 `type|default` 형식을 사용합니다.

커스텀 타입을 만들려면 문자열을 처리하고 해당 타입으로 반환하는 변환 객체를 정의합니다.

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

`@Query`에도 동일하게 적용되며, 타입이 `number`로 지정되면 문자열이 내부적으로 숫자로 변환되어 할당됩니다.

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

StingerLoom 서버 프레임워크에서 주목해야 할 중요한 것은 생성자 부분입니다.

```ts
@Controller("/user")
export class UserController {
    constructor(
        // 1. Point는 주입 가능한 클래스가 아니므로 매번 인스턴스화됩니다.
        private readonly point: Point,
        // 2. UserService는 주입 가능한 클래스이므로 싱글톤 인스턴스로 관리됩니다.
        private readonly userService: UserService,
    ) {}
```

`@Injectable` 장에서 설명한 바와 같이, `Point` 클래스는 `@Injectable` 데코레이터가 없으므로 컨테이너에서 관리되지 않습니다. 요청별로 관리되지 않으며, 컨트롤러나 `Injectable` 클래스에 주입될 때마다 새 인스턴스가 생성됩니다.

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

따라서 `/user/point`를 연속으로 호출하면 다음과 같이 출력됩니다:

```json
{"x":5,"y":5}
{"x":10,"y":10}
```

반면 `Injectable` 클래스는 싱글톤 인스턴스로 관리되므로 컨트롤러나 `Injectable` 클래스에 주입될 때마다 같은 인스턴스가 주입됩니다.

이에 대한 예제는 다음 섹션인 [주입 가능한 클래스](https://github.com/biud436/stingerloom#injectable)를 참조하세요.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## 주입 가능한 클래스

`@Injectable` 데코레이터가 있는 클래스는 다른 클래스의 생성자나 속성에 주입될 수 있습니다. 또한 생성자 매개변수나 속성의 타입을 분석하여 서버 컨테이너에서 관리하는 싱글톤 인스턴스를 생성합니다.

하지만 `@Injectable` 데코레이터가 없어도 주입은 여전히 가능합니다. 다만 `@Injectable` 데코레이터가 표시되지 않으면 클래스는 매번 기본 생성자를 통해 단순히 인스턴스화되며 서버 컨테이너에서 관리되지 않습니다.

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
      throw new BadRequestException("'role' 속성은 입력할 수 없습니다.");
    }

    const newUser = await this.userRepository.create(createUserDto);
    const res = await this.userRepository.save(newUser);

    return ResultUtils.success("사용자 생성 성공.", res);
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
      throw new BadRequestException("사용자가 존재하지 않습니다.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException("비밀번호가 일치하지 않습니다.");
    }

    return user;
  }

  async getUser(ip: string) {
    const user = await this.userRepository.find();
    return ResultUtils.success("사용자 조회 성공", {
      user,
      ip,
    });
  }
}
```

강조된 싱글톤 인스턴스는 단 하나의 인스턴스만 생성된다는 의미입니다. 즉, 컨트롤러나 `Injectable` 클래스에 주입될 때마다 정확히 같은 인스턴스가 주입됩니다.

기본적으로 생성자 기반 주입이 권장되지만, 원한다면 속성 기반 주입도 사용할 수 있습니다.

```ts
@Injectable()
export class UserService {
  @Autowired()
  private readonly discoveryService!: DiscoveryService;
}
```

하지만 속성 기반 주입은 생성자 기반 주입보다 늦게 주입되므로 생성자 기반 주입이 권장됩니다.

또한 `@InjectRepository`는 현재 생성자에서만 주입되므로 속성 기반 주입을 사용할 때 주의하세요.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## 예외 필터와 실행 컨텍스트

예외 필터는 오류를 처리하고 재정의할 수 있는 데코레이터입니다. `@ExceptionFilter` 데코레이터가 첨부되고, 데코레이터의 인수로 오류 클래스가 지정됩니다. 그 다음 오류 클래스에 해당하는 오류가 발생하면 `@Catch` 데코레이터가 있는 메소드가 실행됩니다.
`@BeforeCatch` 데코레이터가 있는 메소드는 `@Catch` 데코레이터가 있는 메소드가 실행되기 전에 실행되고, `@AfterCatch` 데코레이터가 있는 메소드는 `@Catch` 데코레이터가 있는 메소드가 실행된 후에 실행됩니다.

```ts
@ExceptionFilter(InternalServerException)
export class InternalErrorFilter implements Filter {
  private readonly logger = new Logger();

  @BeforeCatch()
  public beforeCatch() {
    this.logger.info("catch 전");
  }

  @Catch()
  public catch(error: any) {
    this.logger.info("[내부 서버 오류] " + error.message);

    return {
      message: error.message,
      status: error.status,
      result: "failure",
    };
  }

  @AfterCatch()
  public afterCatch() {
    this.logger.info("catch 후");
  }
}
```

이렇게 하면 다음과 같이 출력됩니다:

<p align="center">
<img src="https://github.com/biud436/custom-server-framework/assets/13586185/998fe1e3-f705-4a9c-a453-7179f42fc770" />
</p>

예외 메소드들은 `@BeforeCatch -> @Catch -> @AfterCatch` 순서로 실행됩니다. 각 예외 컨텍스트는 예외 처리 클래스당 하나의 인스턴스를 공유하는 공유 인스턴스입니다.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## 데이터베이스 트랜잭션 처리

StingerLoom은 트랜잭션을 처리하기 위한 `@Transactional` 데코레이터를 지원합니다.

Spring에서 영감을 받아, 이 데코레이터의 기본 트랜잭션 격리 수준은 `REPEATABLE READ`입니다.

트랜잭션 격리 수준은 여러 트랜잭션이 동시에 처리될 때 특정 트랜잭션이 다른 트랜잭션의 변경사항을 볼 수 있는 수준을 의미합니다.

주요 수준은 네 가지입니다: `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`.

`@Transactional` 기능은 현재 `@Injectable` 데코레이터가 있는 클래스에만 적용됩니다.

또한 트랜잭션 처리를 위해서는 효율적인 검색을 위해 클래스에 `@TransactionalZone` 데코레이터가 표시되어야 합니다.

`@TransactionalZone` 데코레이터는 트랜잭션 처리를 위해 `EntityManager`와 `QueryRunner`를 주입할 메소드들을 찾아 트랜잭션 처리를 수행합니다.

다음은 트랜잭션을 처리하는 간단한 예제입니다.

```ts
@TransactionalZone()
@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  @Transactional()
  async checkTransaction2() {
    const users = await this.userService.findAll();

    return ResultUtils.success("트랜잭션 확인됨.", {
      users: plainToClass(User, users),
    });
  }

  @BeforeTransaction()
  async beforeTransaction(txId: string) {
    // 이 코드는 트랜잭션이 시작되기 전에 실행됩니다.
  }

  @AfterTransaction()
  async afterTransaction(txId: string) {
    // 이 코드는 트랜잭션이 끝난 후에 실행됩니다.
  }

  @Commit()
  async commit(txId: string) {
    // 이 코드는 트랜잭션이 커밋된 후에 실행됩니다.
  }

  @Rollback()
  async rollback(txId: string, error: any) {
    // 이 코드는 트랜잭션이 롤백된 후에 실행됩니다.
    // 이 메소드는 오류가 발생했을 때만 실행됩니다.
  }

  @Transactional({
    rollback: () => new Exception("트랜잭션이 롤백되었습니다", 500),
  })
  async rollbackCheck() {
    const user = await this.userService.findOneByPk("test");

    return ResultUtils.success("롤백 테스트", {
      user,
    });
  }
}
```

예제에서 볼 수 있듯이 매우 간단합니다. 반환까지 오류가 발생하지 않으면 트랜잭션이 성공적으로 커밋됩니다.

다음은 또 다른 예제인 사용자 등록 예제입니다.

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
      throw new BadRequestException("'role' 속성은 입력할 수 없습니다.");
    }

    const newUser = this.userRepository.create(createUserDto);

    const res = await this.userRepository.save(newUser);

    return ResultUtils.success("사용자 생성 성공.", res);
  }

  // 생략...
}
```

중간에 오류 처리 로직이 보일 것입니다. 간단하게 생각할 수 있습니다. 위 코드에서 오류가 발생하면 트랜잭션이 자동으로 롤백됩니다.

롤백 후 특정 코드를 실행하고 싶다면 다음과 같이 할 수 있습니다.

```ts
    @Rollback()
    async rollback(txId: string, error: any) {
        // 이 코드는 트랜잭션이 롤백된 후에 실행됩니다.
        // 이 메소드는 오류가 발생했을 때만 실행됩니다.
    }
```

`@Rollback()` 데코레이터를 첨부하면, 메소드의 첫 번째 인수는 트랜잭션 ID이고 두 번째 인수는 오류 객체입니다.

또는 트랜잭션이 롤백될 때 특정 오류를 반환하고 싶다면 다음과 같이 할 수 있습니다.

```ts
    @Transactional({
        rollback: () => new Exception("트랜잭션이 롤백되었습니다", 500),
    })
    async rollbackCheck() {
        const user = await this.userService.findOneByPk("test");

        return ResultUtils.success("롤백 테스트", {
            user,
        });
    }
```

트랜잭션 ID는 실제 트랜잭션 ID가 아니라 서버에서 관리하는 트랜잭션 ID입니다.

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
    console.log("커밋 완료:", txId);
  }
}
```

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## 권한 처리

StingerLoom은 세션 기반 인증을 지원합니다.

SessionObject를 상속하는 클래스는 세션 객체로 사용할 수 있습니다.

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

권한 처리는 아직 예제에서 구현되지 않았습니다.

권한 처리를 위해서는 인증 가드(AuthGuard)의 개념과 권한 처리에 필요한 역할(role)의 개념을 구현해야 합니다.

### 세션 처리

더 실용적인 예제는 다음과 같습니다.

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
      message: "로그인 성공.",
      result: "success",
      data: session.user,
    });
  }

  async checkSession(session: SessionObject) {
    return ResultUtils.success("세션 인증 성공", {
      authenticated: session.authenticated,
      user: session.user,
    });
  }
}
```

현재 버전에서는 위와 같이 세션 객체를 사용하여 인증을 구현할 수 있습니다.

### 세션 가드

세션 인증은 `@Session()` 데코레이터를 사용하여 세션 객체를 주입하고 세션 인증을 처리하는 SessionGuard를 추가하여 처리할 수 있습니다.

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

위 가드를 프로바이더에 추가하고 다음과 같이 컨트롤러나 라우터에 첨부하여 사용합니다.

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

이렇게 하면 세션 인증을 통과한 로그인된 사용자에게만 라우터가 실행됩니다.

인증되지 않은 사용자에게는 401 오류가 발생합니다.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## 커스텀 매개변수 데코레이터

`createCustomParamDecorator` 함수를 사용하여 고유한 `ParameterDecorator`를 만들 수 있습니다.

다음은 세션에서 사용자 정보와 사용자 ID를 가져오는 예제입니다.

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

사용자 ID는 다음과 같이 가져올 수 있습니다.

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

최종 사용법은 다음과 같습니다.

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

쿼리했을 때 결과는 다음과 같이 출력됩니다.

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

## 템플릿 엔진

템플릿 엔진을 사용하면 `@View` 데코레이터를 사용하여 HTML 파일을 렌더링할 수 있습니다.

먼저 필요한 패키지를 설치해야 합니다. 터미널에서 다음 명령어를 입력합니다.

```bash
yarn add @fastify/view handlebars
```

`bootstrap.ts` 파일에서 템플릿 엔진을 미들웨어로 등록하면 모든 컨트롤러에서 템플릿 엔진을 사용할 수 있습니다.

```ts
    /**
     * 미들웨어 추가.
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

컨트롤러에서는 `@View` 데코레이터를 사용하여 템플릿에 매핑할 수 있습니다.

```ts
@Controller("/")
export class AppController {
  /**
   * 로그인 페이지를 표시합니다.
   */
  @View("login")
  login() {
    return {
      username: "사용자명",
      password: "비밀번호",
    };
  }

  /**
   * 이 페이지는 로그인된 사용자만 접근할 수 있습니다.
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

뷰의 경로와 라우트가 다른 경우 다음과 같이 `@Render` 데코레이터를 사용하여 템플릿 리소스의 경로를 지정할 수 있습니다.

```ts
@Controller("/")
export class AppController {
  /**
   * 이 페이지는 로그인된 사용자만 접근할 수 있습니다.
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

필요한 매개변수를 반환하면 각 템플릿 엔진이 처리할 수 있습니다.

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
        <input type="password" name="password" placeholder="{{password}}" />
        <input type="submit" value="로그인" />
      </form>
    </div>
  </body>
</html>
```

다음은 세션 정보를 표시하는 예제입니다.

```hbs
<!-- memberInfo.hbs -->
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>세션 예제</title>
  </head>
  <body>
    <p>로그인된 사용자 정보는 <strong>{{username}}</strong>입니다.</p>
  </body>
</html>
```

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## ORM

ORM은 객체와 관계형 데이터베이스 간의 매핑을 지원하는 도구입니다.

StingerLoom은 자체 ORM을 제공하므로 타사 라이브러리 없이도 데이터베이스에 접근할 수 있습니다.

`@Entity` 데코레이터를 사용하여 엔티티를 정의할 수 있습니다. 엔티티는 데이터베이스의 테이블에 매핑됩니다. synchronize 옵션을 사용하여 작성된 엔티티를 데이터베이스와 동기화할 수 있습니다.

`@stingerloom/orm/decorators` 패키지에서 제공하는 `@Column`, `@Entity`, `@Index`를 사용하여 엔티티를 정의할 수 있습니다.

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

리포지토리를 통해 데이터베이스에 접근할 수 있습니다. 리포지토리를 생성하는 방법은 두 가지입니다: `EntityManager`를 주입하여 `getRepository` 메소드를 사용하는 방법과 `@InjectRepository` 데코레이터를 사용하는 방법입니다. 후자의 방법은 TypeORM에서만 지원되며 커스텀 ORM에서는 아직 지원되지 않습니다. 향후 두 ORM에서 모두 사용할 수 있도록 하는 방법을 고려할 것입니다.

```ts
@Injectable()
class MyNodeService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    )

    async findOne(id: number): Promise<MyNode> {

        // MyNode 엔티티에 대한 리포지토리 가져오기
        const myNodeRepository = this.entityManager.getRepository(MyNode);

        // id가 1인 노드 찾기
        const myNode = await myNodeRepository.findOne({
            where: {
                id
            }
        });

        if (!myNode) {
            throw new NotFoundException("노드를 찾을 수 없습니다.");
        }

        return myNode;
    }
}
```

위와 같이 `@InjectEntityManager` 데코레이터를 사용하여 `EntityManager`를 주입하고 리포지토리를 가져올 수 있습니다.

리포지토리 패턴을 통해 데이터베이스에 접근할 수 있습니다.

[▲ 목차로 돌아가기](https://github.com/biud436/stingerloom#%EC%82%AC%EC%9A%A9%EB%B2%95)

## CLI

StingerLoom은 CLI를 지원합니다. CLI를 통해 모듈 파일을 쉽게 생성할 수 있습니다. 현재로서는 꽤 제한적이며, 추가 연구를 통해 Typescript 컴파일러를 사용하여 모듈 정보를 읽는 로직을 추가해야 한다고 생각합니다.

<p align="center">
<img src="https://github.com/biud436/stingerloom/assets/13586185/67bd938e-d882-4119-9912-9a62b56c73a4" />
</p>

새로운 컨트롤러와 서비스를 자동으로 생성하려면 다음 명령어를 사용할 수 있습니다.

```bash
yarn cli
```
