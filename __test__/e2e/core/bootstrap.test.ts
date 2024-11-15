import {
    Controller,
    Get,
    Module,
    ModuleOptions,
    ServerBootstrapApplication,
} from "@stingerloom/core";
import configService from "@stingerloom/core/common/ConfigService";
import { DatabaseClientOptions } from "@stingerloom/core/orm/core/DatabaseClientOptions";
import axios from "axios";

describe("서버 세팅 및 시작 테스트", () => {
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

    @Controller("/")
    class AppController {
        @Get()
        index() {
            return "Hello World";
        }

        @Get("test")
        test() {
            return "this is test";
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

    it("/를 호출한다", async () => {
        const res = await axios.get("http://localhost:3002");

        expect(res.data).toBe("Hello World");
    });

    it("/test를 호출한다", async () => {
        const res = await axios.get("http://localhost:3002/test");

        expect(res.data).toBe("this is test");
    });
});
