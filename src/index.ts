import { FastifyInstance, fastify } from "fastify";
import "dotenv/config";
import "reflect-metadata";
import database from "./lib/Database";

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
        this.handleGuards().handleRoute().createServer();

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

    private createServer(): void {
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
