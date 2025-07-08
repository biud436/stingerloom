import {
  Controller,
  EntryModule,
  Get,
  ServerBootstrapApplication,
} from "@stingerloom/core";
import axios from "axios";

describe("데이터베이스에 연결되지 않았을 때", () => {
  let application: TestServerApplication;

  @Controller("/")
  class AppController {
    @Get("/")
    public async index(): Promise<string> {
      return "Hello, Stingerloom!";
    }
  }

  @EntryModule({
    controllers: [AppController],
    providers: [],
  })
  class AppModule {}

  class TestServerApplication extends ServerBootstrapApplication {
    override beforeStart(): void {}
  }

  beforeAll((done) => {
    application = new TestServerApplication(AppModule);
    application.on("start", () => {
      done();
    });

    application.start();
  });

  afterAll(async () => {
    await application.stop();
  });

  it("정의되어있는가?", () => {
    expect(application).toBeDefined();
  });

  it("GET /를 호출한다", async () => {
    const res = await axios.get("http://localhost:3002");

    expect(res.data).toBe("Hello, Stingerloom!");
  });
});
