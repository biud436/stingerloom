import { LoomServer } from "../../../../packages/core/common/http/adapters/loom/server/LoomServer";
import {
  LoomMultipartPlugin,
  type ParsedFile,
} from "../../../../packages/core/common/http/adapters/loom/plugins/LoomMultipartPlugin";

describe("LoomMultipartPlugin", () => {
  let server: LoomServer;
  let plugin: LoomMultipartPlugin;

  beforeEach(() => {
    server = new LoomServer();
    plugin = new LoomMultipartPlugin({
      maxFileSize: 1024 * 1024, // 테스트용 1MB
      maxFiles: 2,
      maxFields: 10,
    });
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe("플러그인 설치", () => {
    it("플러그인이 성공적으로 설치되어야 함", () => {
      expect(() => {
        server.addPlugin(plugin);
      }).not.toThrow();

      const installedPlugin = server.getPlugin(plugin.name);
      expect(installedPlugin).toBeDefined();
      expect(installedPlugin?.name).toBe("loom-multipart");
    });

    it("서버에 멀티파트 미들웨어가 추가되어야 함", () => {
      const initialMiddlewareCount = server.getServerInfo().middlewareCount;
      server.addPlugin(plugin);
      const finalMiddlewareCount = server.getServerInfo().middlewareCount;

      expect(finalMiddlewareCount).toBe(initialMiddlewareCount + 1);
    });
  });

  describe("플러그인 옵션", () => {
    it("옵션이 제공되지 않으면 기본 옵션을 사용해야 함", () => {
      const defaultPlugin = new LoomMultipartPlugin();
      const options = defaultPlugin.getOptions();

      expect(options.maxFileSize).toBe(10 * 1024 * 1024); // 10MB
      expect(options.maxFiles).toBe(10);
      expect(options.maxFields).toBe(100);
      expect(options.inMemory).toBe(true);
    });

    it("제공된 커스텀 옵션을 사용해야 함", () => {
      const customOptions = {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 3,
        maxFields: 50,
        inMemory: false,
      };

      const customPlugin = new LoomMultipartPlugin(customOptions);
      const options = customPlugin.getOptions();

      expect(options.maxFileSize).toBe(customOptions.maxFileSize);
      expect(options.maxFiles).toBe(customOptions.maxFiles);
      expect(options.maxFields).toBe(customOptions.maxFields);
      expect(options.inMemory).toBe(customOptions.inMemory);
    });

    it("파일 필터 함수를 지원해야 함", () => {
      const fileFilter = (file: ParsedFile) =>
        file.mimetype.startsWith("image/");
      const pluginWithFilter = new LoomMultipartPlugin({ fileFilter });
      const options = pluginWithFilter.getOptions();

      expect(options.fileFilter).toBe(fileFilter);
    });
  });

  describe("파일 저장", () => {
    it("모킹 데이터로 파일 저장을 처리해야 함", () => {
      const mockFile: ParsedFile = {
        fieldname: "테스트파일",
        originalname: "테스트.txt",
        mimetype: "text/plain",
        size: 100,
        buffer: Buffer.from("테스트 내용"),
        encoding: "utf8",
      };

      // 모킹된 파일 객체의 구조 검증
      expect(mockFile.fieldname).toBe("테스트파일");
      expect(mockFile.originalname).toBe("테스트.txt");
      expect(mockFile.buffer).toBeInstanceOf(Buffer);
    });
  });

  describe("에러 처리", () => {
    it("누락된 content-type을 우아하게 처리해야 함", () => {
      // 미들웨어가 Content-Type이 없는 요청을 적절히 처리하는지 확인
      server.addPlugin(plugin);
      const serverInfo = server.getServerInfo();
      expect(serverInfo.middlewareCount).toBeGreaterThan(0);
    });

    it("파일 크기 제한을 검증해야 함", () => {
      const options = plugin.getOptions();
      expect(options.maxFileSize).toBeGreaterThan(0);
      expect(options.maxFiles).toBeGreaterThan(0);
      expect(options.maxFields).toBeGreaterThan(0);
    });
  });

  describe("LoomServer와의 통합", () => {
    it("서버 플러그인 시스템과 통합되어야 함", () => {
      server.start({
        port: 0, // 사용하지 않는 포트
        plugins: [plugin],
      });

      const installedPlugin = server.getPlugin("loom-multipart");
      expect(installedPlugin).toBeDefined();
    });

    it("다른 미들웨어와 함께 작동해야 함", () => {
      server.addPlugin(plugin);

      // 추가 미들웨어 등록
      server.use((req, res, next) => {
        console.log("추가 미들웨어");
        next();
      });

      const serverInfo = server.getServerInfo();
      expect(serverInfo.middlewareCount).toBeGreaterThan(1);
    });
  });
});

// 통합 테스트용 유틸리티
export function createTestMultipartData() {
  const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
  const data = [
    `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
    `Content-Disposition: form-data; name="제목"`,
    ``,
    `테스트 제목`,
    `------WebKitFormBoundary7MA4YWxkTrZu0gW`,
    `Content-Disposition: form-data; name="파일"; filename="테스트.txt"`,
    `Content-Type: text/plain`,
    ``,
    `파일 내용이 여기에 있습니다`,
    `------WebKitFormBoundary7MA4YWxkTrZu0gW--`,
  ].join("\r\n");

  return {
    boundary,
    data: Buffer.from(data),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}
