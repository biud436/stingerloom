import { FastifyRequest } from "fastify";
import * as fastifySession from "@fastify/session";
/**
 * 세션을 프록시로 만듭니다.
 *
 * @param req
 * @returns
 */
export declare function createSessionProxy(req: FastifyRequest): fastifySession.FastifySessionObject;
/**
 * 세션 객체입니다.
 */
export interface SessionObject extends fastifySession.FastifySessionObject {
    authenticated: boolean;
    user: any;
}
