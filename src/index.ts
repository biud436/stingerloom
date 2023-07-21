import { FastifyInstance, fastify } from "fastify";
import "dotenv/config";
import "reflect-metadata";
import database from "./lib/Database";
import fastifyCookie from "@fastify/cookie";
import Container from "typedi";
import { Metadata, MetadataScanner } from "./lib/common/MetadataScanner";
import { PostController } from "./controllers/PostController";

class ServerBootstrapApplication {
    private app!: FastifyInstance;
    private static INSTANCE: ServerBootstrapApplication;

    private constructor() {
        this.app = fastify({
            logger: true,
        });
    }

    public static getInstance(): ServerBootstrapApplication {
        if (!ServerBootstrapApplication.INSTANCE) {
            ServerBootstrapApplication.INSTANCE =
                new ServerBootstrapApplication();
        }

        return ServerBootstrapApplication.INSTANCE;
    }

    public async start(): Promise<void> {
        // prettier-ignore
        this.handleGuards()
            .applyMiddlewares()
            .handleRoute();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const postController = new PostController();

        const scanner = Container.get(MetadataScanner);
        const routers = scanner.makeRouters();

        let router: IteratorResult<Metadata>;
        while ((router = routers.next())) {
            if (router.done) break;
            const metadata = router.value as Metadata;

            if (metadata.method === "GET") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.app.get(metadata.path, metadata.router as any);
            }
        }

        this.createServer();

        await this.connectDatabase();
    }

    private handleGuards(): this {
        const handleErrorWather = (err: unknown) => {
            console.error(err);
        };
        process.on("uncaughtException", handleErrorWather);
        process.on("unhandledRejection", handleErrorWather);

        return this;
    }

    private handleRoute(): this {
        this.app.register(import("./routes"), {
            prefix: "/api",
        });

        return this;
    }

    private applyMiddlewares(): this {
        this.app.register(fastifyCookie, {
            secret: process.env.COOKIE_SECRET,
            hook: "onRequest",
        });

        return this;
    }

    private createServer(): void {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.app.listen({ port: process.env.SERVER_PORT }, (err, _address) => {
            if (err) {
                console.error(err);
            }
        });
    }

    private async connectDatabase(): Promise<void> {
        await database.start();
        const user = await database.echoUser();
        console.log(user);
    }
}

Promise.resolve(ServerBootstrapApplication.getInstance().start()).catch(
    (err) => {
        console.error(err);
    },
);
