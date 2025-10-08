import axios from "axios";
import {
  Controller,
  DatabaseModule,
  EntryModule,
  Get,
  Param,
  ServerBootstrapApplication,
} from "@stingerloom/core";
import { LoomServerFactory } from "@stingerloom/core/common/http/adapters/loom";
import configService from "@stingerloom/core/common/ConfigService";

describe("Loom 서버 Trie 성능 및 라우팅 테스트", () => {
  let application: TestServerApplication;
  const PORT = 3003; // 다른 포트 사용

  @Controller("/")
  class PerformanceController {
    @Get("/")
    index() {
      return "Loom Trie Performance Test";
    }

    // 정적 라우트들
    @Get("/api/users")
    getUsers() {
      return { type: "static", route: "/api/users", server: "loom" };
    }

    @Get("/api/posts")
    getPosts() {
      return { type: "static", route: "/api/posts", server: "loom" };
    }

    @Get("/api/comments")
    getComments() {
      return { type: "static", route: "/api/comments", server: "loom" };
    }

    @Get("/api/categories")
    getCategories() {
      return { type: "static", route: "/api/categories", server: "loom" };
    }

    @Get("/api/tags")
    getTags() {
      return { type: "static", route: "/api/tags", server: "loom" };
    }

    // 1단계 파라미터 라우트들
    @Get("/api/users/:id")
    getUserById(@Param("id") id: string) {
      return {
        type: "parameter-1",
        route: "/api/users/:id",
        params: { id },
        server: "loom",
      };
    }

    @Get("/api/posts/:id")
    getPostById(@Param("id") id: string) {
      return {
        type: "parameter-1",
        route: "/api/posts/:id",
        params: { id },
        server: "loom",
      };
    }

    @Get("/api/categories/:name")
    getCategoryByName(@Param("name") name: string) {
      return {
        type: "parameter-1",
        route: "/api/categories/:name",
        params: { name },
        server: "loom",
      };
    }

    // 2단계 파라미터 라우트들
    @Get("/api/users/:userId/posts/:postId")
    getUserPost(
      @Param("userId") userId: string,
      @Param("postId") postId: string,
    ) {
      return {
        type: "parameter-2",
        route: "/api/users/:userId/posts/:postId",
        params: { userId, postId },
        server: "loom",
      };
    }

    @Get("/api/users/:userId/comments/:commentId")
    getUserComment(
      @Param("userId") userId: string,
      @Param("commentId") commentId: string,
    ) {
      return {
        type: "parameter-2",
        route: "/api/users/:userId/comments/:commentId",
        params: { userId, commentId },
        server: "loom",
      };
    }

    @Get("/api/posts/:postId/comments/:commentId")
    getPostComment(
      @Param("postId") postId: string,
      @Param("commentId") commentId: string,
    ) {
      return {
        type: "parameter-2",
        route: "/api/posts/:postId/comments/:commentId",
        params: { postId, commentId },
        server: "loom",
      };
    }

    // 3단계 파라미터 라우트들
    @Get("/api/users/:userId/posts/:postId/comments/:commentId")
    getUserPostComment(
      @Param("userId") userId: string,
      @Param("postId") postId: string,
      @Param("commentId") commentId: string,
    ) {
      return {
        type: "parameter-3",
        route: "/api/users/:userId/posts/:postId/comments/:commentId",
        params: { userId, postId, commentId },
        server: "loom",
      };
    }

    // 깊은 중첩 라우트 (Trie 효율성 테스트)
    @Get(
      "/api/v1/organizations/:orgId/projects/:projectId/repositories/:repoId/branches/:branchId/commits/:commitId",
    )
    getCommit(
      @Param("orgId") orgId: string,
      @Param("projectId") projectId: string,
      @Param("repoId") repoId: string,
      @Param("branchId") branchId: string,
      @Param("commitId") commitId: string,
    ) {
      return {
        type: "deep-nested",
        route:
          "/api/v1/organizations/:orgId/projects/:projectId/repositories/:repoId/branches/:branchId/commits/:commitId",
        params: { orgId, projectId, repoId, branchId, commitId },
        server: "loom",
        depth: 7,
      };
    }

    // 유사한 패턴의 라우트들 (Trie 구분 능력 테스트)
    @Get("/similar/path/a")
    similarPathA() {
      return { type: "similar", variant: "a", server: "loom" };
    }

    @Get("/similar/path/b")
    similarPathB() {
      return { type: "similar", variant: "b", server: "loom" };
    }

    @Get("/similar/path/c")
    similarPathC() {
      return { type: "similar", variant: "c", server: "loom" };
    }

    @Get("/similar/:param/a")
    similarParamA(@Param("param") param: string) {
      return { type: "similar-param", variant: "a", param, server: "loom" };
    }

    @Get("/similar/:param/b")
    similarParamB(@Param("param") param: string) {
      return { type: "similar-param", variant: "b", param, server: "loom" };
    }

    // 성능 벤치마킹 엔드포인트
    @Get("/benchmark/info")
    getBenchmarkInfo() {
      return {
        message: "Loom Server Trie Benchmark",
        server: "loom",
        routing: "Trie-based O(k) complexity",
        totalRoutes: "20+",
        features: [
          "Static route matching",
          "Parameter extraction",
          "Deep nesting support",
          "Similar pattern distinction",
        ],
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
    controllers: [PerformanceController],
    providers: [],
  })
  class AppModule {}

  class TestServerApplication extends ServerBootstrapApplication {
    override beforeStart(): void {
      console.log("Starting Loom Server for Performance testing...");
    }
  }

  beforeAll((done) => {
    application = new TestServerApplication(AppModule, new LoomServerFactory());

    application.on("start", () => {
      console.log(`Loom performance test server started on port ${PORT}`);
      done();
    });

    application.start({
      port: PORT,
    });
  }, 30000);

  afterAll(async () => {
    console.log("Stopping Loom performance test server...");
    await application.stop();
  });

  describe("정적 라우트 성능 테스트", () => {
    const staticRoutes = [
      "/api/users",
      "/api/posts",
      "/api/comments",
      "/api/categories",
      "/api/tags",
    ];

    it.each(staticRoutes)("정적 라우트 %s 처리", async (route) => {
      const res = await axios.get(`http://localhost:${PORT}${route}`);

      expect(res.status).toBe(200);
      expect(res.data.type).toBe("static");
      expect(res.data.server).toBe("loom");
      expect(res.data.route).toBe(route);
    });

    it("정적 라우트 배치 처리 성능", async () => {
      const start = Date.now();

      const promises = staticRoutes.map((route) =>
        axios.get(`http://localhost:${PORT}${route}`),
      );

      const results = await Promise.all(promises);
      const end = Date.now();

      expect(results).toHaveLength(staticRoutes.length);
      results.forEach((result) => {
        expect(result.status).toBe(200);
        expect(result.data.server).toBe("loom");
      });

      console.log(
        `정적 라우트 ${staticRoutes.length}개 처리 시간: ${end - start}ms`,
      );
    });
  });

  describe("파라미터 라우트 성능 테스트", () => {
    const parameterTests = [
      {
        route: "/api/users/123",
        expected: { type: "parameter-1", params: { id: "123" } },
      },
      {
        route: "/api/posts/456",
        expected: { type: "parameter-1", params: { id: "456" } },
      },
      {
        route: "/api/categories/javascript",
        expected: { type: "parameter-1", params: { name: "javascript" } },
      },
    ];

    it.each(parameterTests)(
      "1단계 파라미터 라우트 $route 처리",
      async ({ route, expected }) => {
        const res = await axios.get(`http://localhost:${PORT}${route}`);

        expect(res.status).toBe(200);
        expect(res.data.type).toBe(expected.type);
        expect(res.data.params).toEqual(expected.params);
        expect(res.data.server).toBe("loom");
      },
    );

    it("2단계 파라미터 라우트 처리", async () => {
      const route = "/api/users/user123/posts/post456";
      const res = await axios.get(`http://localhost:${PORT}${route}`);

      expect(res.status).toBe(200);
      expect(res.data.type).toBe("parameter-2");
      expect(res.data.params).toEqual({
        userId: "user123",
        postId: "post456",
      });
      expect(res.data.server).toBe("loom");
    });

    it("3단계 파라미터 라우트 처리", async () => {
      const route = "/api/users/user1/posts/post2/comments/comment3";
      const res = await axios.get(`http://localhost:${PORT}${route}`);

      expect(res.status).toBe(200);
      expect(res.data.type).toBe("parameter-3");
      expect(res.data.params).toEqual({
        userId: "user1",
        postId: "post2",
        commentId: "comment3",
      });
      expect(res.data.server).toBe("loom");
    });
  });

  describe("깊은 중첩 라우트 테스트 (Trie 효율성)", () => {
    it("7단계 깊이 라우트 처리", async () => {
      const route =
        "/api/v1/organizations/myorg/projects/myproject/repositories/myrepo/branches/main/commits/abc123";
      const res = await axios.get(`http://localhost:${PORT}${route}`);

      expect(res.status).toBe(200);
      expect(res.data.type).toBe("deep-nested");
      expect(res.data.depth).toBe(7);
      expect(res.data.params).toEqual({
        orgId: "myorg",
        projectId: "myproject",
        repoId: "myrepo",
        branchId: "main",
        commitId: "abc123",
      });
      expect(res.data.server).toBe("loom");
    });
  });

  describe("유사 패턴 구분 테스트", () => {
    it("유사한 정적 경로 구분", async () => {
      const routes = [
        { path: "/similar/path/a", variant: "a" },
        { path: "/similar/path/b", variant: "b" },
        { path: "/similar/path/c", variant: "c" },
      ];

      for (const { path, variant } of routes) {
        const res = await axios.get(`http://localhost:${PORT}${path}`);

        expect(res.status).toBe(200);
        expect(res.data.type).toBe("similar");
        expect(res.data.variant).toBe(variant);
        expect(res.data.server).toBe("loom");
      }
    });

    it("유사한 파라미터 경로 구분", async () => {
      const routes = [
        { path: "/similar/test/a", variant: "a", param: "test" },
        { path: "/similar/demo/b", variant: "b", param: "demo" },
      ];

      for (const { path, variant, param } of routes) {
        const res = await axios.get(`http://localhost:${PORT}${path}`);

        expect(res.status).toBe(200);
        expect(res.data.type).toBe("similar-param");
        expect(res.data.variant).toBe(variant);
        expect(res.data.param).toBe(param);
        expect(res.data.server).toBe("loom");
      }
    });
  });

  describe("대량 요청 처리 성능 테스트", () => {
    it("다양한 패턴 100개 요청 동시 처리", async () => {
      const routes = [
        "/api/users",
        "/api/users/123",
        "/api/users/456/posts/789",
        "/api/posts/abc",
        "/api/categories/tech",
        "/similar/path/a",
        "/similar/test/b",
      ];

      const start = Date.now();
      const promises = [];

      // 100개 요청 생성 (각 패턴을 여러 번)
      for (let i = 0; i < 100; i++) {
        const route = routes[i % routes.length];
        promises.push(axios.get(`http://localhost:${PORT}${route}`));
      }

      const results = await Promise.all(promises);
      const end = Date.now();

      expect(results).toHaveLength(100);
      results.forEach((result) => {
        expect(result.status).toBe(200);
        expect(result.data.server).toBe("loom");
      });

      console.log(`100개 다양한 요청 처리 시간: ${end - start}ms`);
      console.log(`평균 응답 시간: ${(end - start) / 100}ms per request`);
    });

    it("동일 패턴 다른 파라미터 연속 처리", async () => {
      const start = Date.now();
      const promises = [];

      // 같은 패턴에 다른 파라미터로 50개 요청
      for (let i = 0; i < 50; i++) {
        promises.push(axios.get(`http://localhost:${PORT}/api/users/${i}`));
      }

      const results = await Promise.all(promises);
      const end = Date.now();

      expect(results).toHaveLength(50);
      results.forEach((result, index) => {
        expect(result.status).toBe(200);
        expect(result.data.params.id).toBe(index.toString());
        expect(result.data.server).toBe("loom");
      });

      console.log(`동일 패턴 50개 요청 처리 시간: ${end - start}ms`);
    });
  });

  describe("벤치마크 정보 확인", () => {
    it("벤치마크 정보 조회", async () => {
      const res = await axios.get(`http://localhost:${PORT}/benchmark/info`);

      expect(res.status).toBe(200);
      expect(res.data).toEqual({
        message: "Loom Server Trie Benchmark",
        server: "loom",
        routing: "Trie-based O(k) complexity",
        totalRoutes: "20+",
        features: [
          "Static route matching",
          "Parameter extraction",
          "Deep nesting support",
          "Similar pattern distinction",
        ],
      });
    });
  });
});
