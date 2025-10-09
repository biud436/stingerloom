import axios from "axios";
import {
  Controller,
  DatabaseModule,
  EntryModule,
  Get,
  Param,
  ServerBootstrapApplication,
  Post,
  Body,
  Query,
} from "@stingerloom/core";
import { LoomServerFactory } from "@stingerloom/core/common/http/adapters/loom";
import configService from "@stingerloom/core/common/ConfigService";
import { IsNumber, IsString } from "class-validator";

describe("Loom 서버 파라미터 및 Trie 라우팅 테스트", () => {
  let application: TestServerApplication;
  const PORT = 3002; // 다른 포트 사용

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

  class CreateUserDto {
    @IsString()
    name!: string;

    @IsString()
    email!: string;

    @IsNumber()
    age!: number;
  }

  @Controller("/")
  class AppController {
    @Get("/")
    index() {
      return {
        message: "Loom Server Param Test",
        server: "loom",
        routing: "Trie-based",
      };
    }

    @Get("/users/:id")
    async getUserById(@Param("id") id: string) {
      return {
        message: `User with ID: ${id}`,
        userId: id,
        server: "loom",
        extractedBy: "Trie parameter matching",
      };
    }

    @Get("/users/:id/posts/:postId")
    async getUserPost(
      @Param("id") userId: string,
      @Param("postId") postId: string,
    ) {
      return {
        message: `Post ${postId} by user ${userId}`,
        userId,
        postId,
        server: "loom",
        extractedBy: "Trie multi-parameter matching",
      };
    }

    @Get("/blog/:id/:title")
    async resolveBlogPost(
      @Param("id|0") id: number,
      @Param("title") title: string,
    ) {
      return {
        id,
        title,
        server: "loom",
        message: "Blog post with default value handling",
      };
    }

    @Get("/point/:coordinates")
    async resolvePoint(@Param("coordinates") point: Point) {
      return {
        x: point.getX(),
        y: point.getY(),
        server: "loom",
        message: "Custom parameter transformation",
      };
    }

    @Get("/api/v1/organizations/:orgId/projects/:projectId/issues/:issueId")
    async getIssue(
      @Param("orgId") orgId: string,
      @Param("projectId") projectId: string,
      @Param("issueId") issueId: string,
    ) {
      return {
        message: "Deep nested route with multiple parameters",
        orgId,
        projectId,
        issueId,
        server: "loom",
        depth: 6,
        routing: "Trie handles deep nesting efficiently",
      };
    }

    @Get("/search")
    async search(@Query("q") query: string, @Query("limit|10") limit: number) {
      return {
        message: "Search results",
        query,
        limit,
        server: "loom",
        results: Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
          id: i + 1,
          title: `Result ${i + 1} for "${query}"`,
        })),
      };
    }

    @Post("/users")
    async createUser(@Body() userData: CreateUserDto) {
      return {
        message: "User created via Loom server",
        data: userData,
        id: Math.random().toString(36).substr(2, 9),
        server: "loom",
        created: new Date().toISOString(),
      };
    }
  }

  @EntryModule({
    imports: [
      DatabaseModule.forRoot({
        type: "mysql",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        database: configService.get<string>("DB_NAME"),
        password: configService.get<string>("DB_PASSWORD"),
        username: configService.get<string>("DB_USER"),
        entities: [__dirname + "/entity/*.ts", __dirname + "/entity/map/*.ts"],
        synchronize: true,
        logging: false,
      }),
    ],
    controllers: [AppController],
    providers: [],
  })
  class AppModule {}

  class TestServerApplication extends ServerBootstrapApplication {
    override beforeStart(): void {
      console.log("Starting Loom Server for Parameter testing...");
    }
  }

  beforeAll((done) => {
    application = new TestServerApplication(AppModule, new LoomServerFactory());

    application.on("start", () => {
      console.log(`Loom parameter test server started on port ${PORT}`);
      done();
    });

    application.start({
      port: PORT,
    });
  }, 30000);

  afterAll(async () => {
    console.log("Stopping Loom parameter test server...");
    await application.stop();
  });

  describe("단일 파라미터 테스트", () => {
    it("단일 파라미터 추출 - /users/:id", async () => {
      const userId = "12345";
      const res = await axios.get(`http://localhost:${PORT}/users/${userId}`);

      expect(res.data).toEqual({
        message: `User with ID: ${userId}`,
        userId,
        server: "loom",
        extractedBy: "Trie parameter matching",
      });
      expect(res.status).toBe(200);
    });

    it("숫자 파라미터 처리", async () => {
      const userId = "999";
      const res = await axios.get(`http://localhost:${PORT}/users/${userId}`);

      expect(res.data.userId).toBe(userId);
      expect(res.status).toBe(200);
    });
  });

  describe("다중 파라미터 테스트", () => {
    it("두 개 파라미터 추출 - /users/:id/posts/:postId", async () => {
      const userId = "user123";
      const postId = "post456";
      const res = await axios.get(
        `http://localhost:${PORT}/users/${userId}/posts/${postId}`,
      );

      expect(res.data).toEqual({
        message: `Post ${postId} by user ${userId}`,
        userId,
        postId,
        server: "loom",
        extractedBy: "Trie multi-parameter matching",
      });
      expect(res.status).toBe(200);
    });

    it("기본값 처리 - /blog/:id/:title", async () => {
      const res = await axios.get(
        `http://localhost:${PORT}/blog/42/hello-world`,
      );

      expect(res.data).toEqual({
        id: 42,
        title: "hello-world",
        server: "loom",
        message: "Blog post with default value handling",
      });
      expect(res.status).toBe(200);
    });
  });

  describe("커스텀 파라미터 변환 테스트", () => {
    it("Point 객체 변환 - /point/:coordinates", async () => {
      const res = await axios.get(`http://localhost:${PORT}/point/10,20`);

      expect(res.data).toEqual({
        x: 10,
        y: 20,
        server: "loom",
        message: "Custom parameter transformation",
      });
      expect(res.status).toBe(200);
    });
  });

  describe("깊은 중첩 라우트 테스트 (Trie 성능 검증)", () => {
    it("6단계 깊이의 중첩 라우트", async () => {
      const orgId = "myorg";
      const projectId = "myproject";
      const issueId = "issue123";

      const res = await axios.get(
        `http://localhost:${PORT}/api/v1/organizations/${orgId}/projects/${projectId}/issues/${issueId}`,
      );

      expect(res.data).toEqual({
        message: "Deep nested route with multiple parameters",
        orgId,
        projectId,
        issueId,
        server: "loom",
        depth: 6,
        routing: "Trie handles deep nesting efficiently",
      });
      expect(res.status).toBe(200);
    });
  });

  describe("쿼리 파라미터 테스트", () => {
    it("쿼리 파라미터 처리 - /search", async () => {
      const res = await axios.get(
        `http://localhost:${PORT}/search?q=loom&limit=3`,
      );

      expect(res.data).toEqual({
        message: "Search results",
        query: "loom",
        limit: 3,
        server: "loom",
        results: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            title: expect.stringContaining("loom"),
          }),
        ]),
      });
      expect(res.data.results).toHaveLength(3);
      expect(res.status).toBe(200);
    });

    it("기본값이 적용된 쿼리 파라미터", async () => {
      const res = await axios.get(`http://localhost:${PORT}/search?q=test`);

      expect(res.data.limit).toBe(10); // 기본값
      expect(res.data.results).toHaveLength(5); // Math.min(10, 5)
      expect(res.status).toBe(200);
    });
  });

  describe("POST 요청 및 Body 파라미터 테스트", () => {
    it("JSON Body 처리 - POST /users", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
      };

      const res = await axios.post(`http://localhost:${PORT}/users`, userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      expect(res.data).toEqual({
        message: "User created via Loom server",
        data: userData,
        id: expect.any(String),
        server: "loom",
        created: expect.any(String),
      });
      expect(res.status).toBe(201);
    });
  });

  describe("Trie 라우팅 성능 테스트", () => {
    it("다양한 라우트 패턴 동시 처리", async () => {
      const routes = [
        "/users/123",
        "/users/456/posts/789",
        "/blog/1/test-post",
        "/point/5,10",
        "/api/v1/organizations/org/projects/proj/issues/1",
        "/search?q=performance&limit=5",
      ];

      const promises = routes.map((route) =>
        axios.get(`http://localhost:${PORT}${route}`),
      );

      const results = await Promise.all(promises);

      // 모든 요청이 성공적으로 처리되었는지 확인
      results.forEach((result) => {
        expect(result.status).toBe(200);
        expect(result.data.server).toBe("loom");
      });
    });

    it("같은 패턴의 다른 파라미터 처리", async () => {
      const userIds = ["1", "2", "3", "abc", "xyz", "user123"];

      const promises = userIds.map((id) =>
        axios.get(`http://localhost:${PORT}/users/${id}`),
      );

      const results = await Promise.all(promises);

      results.forEach((result, index) => {
        expect(result.status).toBe(200);
        expect(result.data.userId).toBe(userIds[index]);
        expect(result.data.extractedBy).toBe("Trie parameter matching");
      });
    });
  });
});
