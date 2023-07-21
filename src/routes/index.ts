import { FastifyInstance, fastify } from "fastify";
import v1 from "./v1";
import os from "os";
import { serializer } from "../utils/serializer";

function home(fastify: FastifyInstance, _options = {}, done = () => {}): void {
    fastify.get("/", async (_request, _reply) => {
        _reply.header("Content-Type", "application/json").code(200);

        return serializer({
            name: os.cpus().map((cpu) => cpu.model),
        });
    });
    fastify.get("/v1", v1);

    done();
}

export default home;
