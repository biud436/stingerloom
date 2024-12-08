import { Application } from "express";
import { HttpServer, ServerOptions } from "../../interfaces";
import { ExpressRouteRegistry } from "./ExpressRouteRegistry";
import express from "express";
import { GlobalExceptionHandler } from "../../../GlobalExceptionHandler";
import http from "node:http";
import cookieParser from "cookie-parser";

export class ExpressServerAdapter implements HttpServer {
    private app: Application;
    private routeRegistry: ExpressRouteRegistry;
    private server?: http.Server;

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(cookieParser());

        this.routeRegistry = new ExpressRouteRegistry(
            this.app,
            new GlobalExceptionHandler(),
        );
    }

    async start(options: ServerOptions): Promise<void> {
        const { port, host } = options;

        return new Promise<void>((resolve) => {
            const callback = () => resolve();
            if (host) {
                this.server = this.app.listen(port, host, callback);
            } else {
                this.server = this.app.listen(port, callback);
            }
        });
    }

    async stop(): Promise<void> {
        if (this.server) {
            await this.server.close();
        }
    }

    getInstance(): Application {
        return this.app;
    }

    getRouteRegistry() {
        return this.routeRegistry;
    }
}
