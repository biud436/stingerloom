/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    BadRequestException,
    Controller,
    Get,
    Module,
    ModuleOptions,
    ServerBootstrapApplication,
} from "@stingerloom/core";
import { ExpressServerFactory } from "@stingerloom/core/common/http/adapters/express";
import axios from "axios";

describe("서버 세팅 및 시작 테스트", () => {
    let application: TestServerApplication;

    @Controller("/")
    class AppController {
        @Get("/")
        index() {
            return "Hello World";
        }

        @Get("/test")
        test() {
            throw new BadRequestException("test");

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
            });
        }
    }

    beforeAll((done) => {
        application = new TestServerApplication(new ExpressServerFactory());
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
        try {
            await axios.get("http://localhost:3002/test");
        } catch (error: any) {
            expect(error.response.status).toBe(400);
        }
    });
});
