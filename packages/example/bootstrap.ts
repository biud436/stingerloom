import { ServerBootstrapApplication } from "@stingerloom/bootstrap";
import { PostController } from "./controllers/post/PostController";
import { UserController } from "./controllers/user/UserController";
import { InternalErrorFilter } from "./exceptions/InternalErrorFilter";
import { option as databaseOption } from "./config";
import { GameMapService } from "./entity/map/GameMapService";
import { UserService } from "./controllers/user/UserService";
import { ModuleOptions } from "@stingerloom/common";
import fastifyCookie from "@fastify/cookie";
import fastifyFormdody from "@fastify/formbody";
import fastifySession from "@fastify/session";
import { AuthService } from "./controllers/auth/AuthService";
import { AuthController } from "./controllers/auth/AuthController";
import { SessionGuard } from "./controllers/auth/guards/SessionGuard";
import handlebars from "handlebars";
import view from "@fastify/view";
import { AppController } from "./controllers/app/AppController";
import { TestController } from "./controllers/test/TestController";
import { TestService } from "./controllers/test/TestService";

/**
 * @class StingerLoomBootstrapApplication
 * @description
 * 서버 실행을 위한 기능들이 구현되어있는 클래스입니다.
 * 필수 기능들은 ServerBootstrapApplication 클래스에 있고 이를 상속받아 구현되었습니다.
 *
 * `beforeStart` 메서드를 오버라이딩하여 필요한 기능들을 추가할 수 있습니다.
 */
export class StingerLoomBootstrapApplication extends ServerBootstrapApplication {
    /**
     * 서버가 시작되기 전에 모듈을 초기화합니다.
     */
    override beforeStart(): void {
        this.moduleOptions = ModuleOptions.merge({
            controllers: [
                AppController,
                PostController,
                UserController,
                AuthController,
                TestController,
            ],
            providers: [
                InternalErrorFilter,
                GameMapService,
                UserService,
                AuthService,
                SessionGuard,
                TestService,
            ],
            configuration: databaseOption,
        });
    }
    /**
     * 미들웨어를 추가합니다.
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
}
Promise.resolve(new StingerLoomBootstrapApplication().start()).catch((err) => {
    console.error(err);
});
