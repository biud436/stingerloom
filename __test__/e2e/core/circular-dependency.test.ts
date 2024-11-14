import axios from "axios";
import configService from "@stingerloom/core/common/ConfigService";
import { DatabaseClientOptions } from "@stingerloom/core/orm/core/DatabaseClientOptions";
import {
    Controller,
    Get,
    Injectable,
    Module,
    ModuleOptions,
    ServerBootstrapApplication,
} from "@stingerloom/core";

describe("CircularDependency 테스트", () => {
    let application: TestServerApplication;
    const option: DatabaseClientOptions = {
        type: "mariadb",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        database: configService.get<string>("DB_NAME"),
        password: configService.get<string>("DB_PASSWORD"),
        username: configService.get<string>("DB_USER"),
        entities: [__dirname + "/entity/*.ts", __dirname + "/entity/map/*.ts"],
        synchronize: true,
        logging: true,
    };

    @Injectable()
    class AppService {
        constructor() {}

        getHello() {
            return "hello";
        }
    }

    @Injectable()
    class CircularService {
        constructor(
            private readonly appService: AppService /**
             * 활성화하면 테스트가 실패합니다.
             */, // private readonly circularService: CircularService,
        ) {}

        getHello() {
            return this.appService.getHello();
        }
    }

    @Controller("/")
    class AppController {
        constructor(
            private readonly appService: AppService,
            private readonly circularService: CircularService,
        ) {}

        @Get()
        async getHello() {
            return this.appService.getHello();
        }

        @Get("/circular")
        async getCircular() {
            return this.circularService.getHello();
        }
    }

    @Module({
        controllers: [AppController],
        providers: [AppService, CircularService],
    })
    class TestServerApplication extends ServerBootstrapApplication {
        override beforeStart(): void {
            this.moduleOptions = ModuleOptions.merge({
                controllers: [],
                providers: [],
                configuration: option,
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

    it("AppService.getHello() 호출 시 'hello'를 반환한다.", async () => {
        const { data } = await axios.get("http://localhost:3002");
        expect(data).toBe("hello");
    });
    it("AppService.getCircular() 호출 시 'hello'를 반환한다.", async () => {
        const { data } = await axios.get("http://localhost:3002/circular");
        expect(data).toBe("hello");
    });

    it("AppService.getHello() 호출 시 'hello'를 반환한다2", async () => {
        const appService = await application.get<AppService>(AppService);
        expect(appService.getHello()).toBe("hello");
    });
    it("AppService.getCircular() 호출 시 'hello'를 반환한다2", async () => {
        const circularService =
            await application.get<CircularService>(CircularService);
        expect(circularService.getHello()).toBe("hello");
    });
});