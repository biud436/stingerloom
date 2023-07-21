import { FastifyInstance, fastify } from "fastify";
import v1 from "./v1";
import os from "os";
import { serializer } from "../utils/serializer";
import { useJson } from "../lib/useJson";

function home(fastify: FastifyInstance, _options = {}, done = () => {}): void {
    fastify.get("/", async (_request, _reply) => {
        useJson(_reply).code(200);

        return serializer({
            name: os.cpus().map((cpu) => cpu.model),
        });
    });
    fastify.get("/v1", v1);

    done();
}

export default home;
