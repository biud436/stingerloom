import { FastifyInstance, fastify } from "fastify";
import { HttpServer, ServerOptions } from "../../interfaces";

export class FastifyServerAdapter implements HttpServer {
    private app: FastifyInstance;

    constructor() {
        this.app = fastify();
    }

    async start(options: ServerOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            this.app.listen(options, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    async stop(): Promise<void> {
        await this.app.close();
    }

    getInstance(): FastifyInstance {
        return this.app;
    }
}
