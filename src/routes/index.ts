import { FastifyInstance, fastify } from "fastify";
import v1 from "./v1";
import os from "os";
import { serializer } from "../utils/serializer";
import { useJson } from "../lib/useJson";
import { ReplyBuilder } from "../lib/ReplyBuilder";

function home(fastify: FastifyInstance, _options = {}, done = () => {}): void {
    fastify.get("/", async (_request, _reply) => {
        const builder = new ReplyBuilder(_reply);
        builder.json().statusOK();

        return serializer({
            name: os.cpus().map((cpu) => cpu.model),
        });
    });
    fastify.get("/v1", v1);

    done();
}

export default home;
