import { ServerBootstrapApplication } from "@stingerloom/bootstrap";
import {
    Controller,
    Get,
    Module,
    ModuleOptions,
    Param,
} from "@stingerloom/common";
import { DataSourceOptions } from "typeorm";
import configService from "@stingerloom/common/ConfigService";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import axios from "axios";

describe("파라미터 테스트", () => {
    let application: TestServerApplication;
    const option: DataSourceOptions = {
        type: "mariadb",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        database: configService.get<string>("DB_NAME"),
        password: configService.get<string>("DB_PASSWORD"),
        username: configService.get<string>("DB_USER"),
        entities: [__dirname + "/entity/*.ts", __dirname + "/entity/map/*.ts"],
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: true,
        logging: true,
    };

    @Controller("/")
    class AppController {
        @Get("/blog/:id/:title")
        async resolveIdAndTitle(
            @Param("id") id: number,
            @Param("title") title: string,
        ) {
            return { id, title };
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

    it(":id와 :title 파라미터를 받아서 객체로 반환하는지 테스트", async () => {
        const res = await axios.get("http://localhost:3002/blog/1/test");

        expect(res.data).toEqual({ id: 1, title: "test" });
    });
});
