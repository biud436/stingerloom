import {
    Controller,
    Get,
    Module,
    ModuleOptions,
    ServerBootstrapApplication,
} from "@stingerloom/core";

describe("데이터베이스에 연결되지 않았을 때", () => {
    let application: TestServerApplication;

    @Controller("/")
    class AppController {
        @Get("/")
        public async index(): Promise<string> {
            return "Hello, Stingerloom!";
        }
    }

    @Module({
        controllers: [AppController],
        providers: [],
    })
    class TestServerApplication extends ServerBootstrapApplication {
        override beforeStart(): void {
            this.moduleOptions = ModuleOptions.merge({
                controllers: [],
                providers: [],
            });
        }
    }

    beforeAll((done) => {
        application = new TestServerApplication();
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
});
