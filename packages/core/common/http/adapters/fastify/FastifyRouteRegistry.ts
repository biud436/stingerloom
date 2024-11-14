import { HttpRoute, HttpRouteRegistry } from "../../interfaces";

import { FastifyInstance } from "fastify";
import { FastifyHandlerAdapter } from "./FastifyHandlerAdapter";

export class FastifyRouteRegistry implements HttpRouteRegistry {
    constructor(private app: FastifyInstance) {}

    register(route: HttpRoute): void {
        const handler = FastifyHandlerAdapter.adapt(route.handler);

        this.app[route.method](route.path, async (request, reply) => {
            await handler(request, reply);
        });
    }
}
