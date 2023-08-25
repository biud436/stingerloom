import { FastifyRequest } from "fastify";
import * as fastifySession from "@fastify/session";

/**
 * 세션을 프록시로 만듭니다.
 *
 * @param req
 * @returns
 */
export function createSessionProxy(req: FastifyRequest) {
    return new Proxy(req.session, {
        get: (target, prop) => {
            return Reflect.get(target, prop);
        },
        set: (target, prop, value) => {
            Reflect.set(target, prop, value);
            req.session.save();
            return true;
        },
    });
}

/**
 * 세션 객체입니다.
 */
export interface SessionObject extends fastifySession.FastifySessionObject {
    authenticated: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any;
}
