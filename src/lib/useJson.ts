import { FastifyReply } from "fastify";

export function useJson(_reply: FastifyReply) {
    _reply.header("Content-Type", "application/json");

    return _reply;
}
