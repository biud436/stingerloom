import { FastifyInstance } from "fastify";
import v1 from "./v1";
import os from "os";
import { serializer } from "../utils/serializer";
import { ReplyBuilder } from "../lib/ReplyBuilder";

const handler: FastifyFPHandler = async (_request, _reply) => {
    const builder = new ReplyBuilder(_reply);

    return builder
        .json()
        .statusOK()
        .response(
            serializer({
                name: os.cpus().map((cpu) => cpu.model),
            }),
        );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function home(fastify: FastifyInstance, _options = {}, done = () => {}): void {
    fastify.get("/", handler);
    fastify.get("/v1", v1);

    done();
}

export default home;
