import { FastifyServerAdapter } from "./FastifyServerAdater";
import { ServerFactory } from "../../ServerFactory";
import { HttpServer } from "../../interfaces";

export class FastifyServerFactory implements ServerFactory {
    createServer(): HttpServer {
        return new FastifyServerAdapter();
    }
}
