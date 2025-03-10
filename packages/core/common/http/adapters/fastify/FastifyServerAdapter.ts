import { FastifyInstance, fastify } from "fastify";
import { HttpServer, ServerOptions } from "../../interfaces";
import { FastifyRouteRegistry } from "./FastifyRouteRegistry";
import { GlobalExceptionHandler } from "../../../GlobalExceptionHandler";

export class FastifyServerAdapter implements HttpServer {
  private app: FastifyInstance;
  private routeRegistry: FastifyRouteRegistry;

  constructor() {
    this.app = fastify();
    this.routeRegistry = new FastifyRouteRegistry(
      this.app,
      new GlobalExceptionHandler(),
    );
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

  getRouteRegistry() {
    return this.routeRegistry;
  }
}
