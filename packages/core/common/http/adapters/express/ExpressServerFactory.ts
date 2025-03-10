import { ServerFactory } from "../../ServerFactory";
import { HttpServer } from "../../interfaces";
import { ExpressServerAdapter } from "./ExpressServerAdapter";

export class ExpressServerFactory implements ServerFactory {
  createServer(): HttpServer {
    return new ExpressServerAdapter();
  }
}
