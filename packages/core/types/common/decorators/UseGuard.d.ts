import { FastifyRequest } from "fastify/types/request";
import { ClazzType } from "../RouterMapper";
import { FastifyReply } from "fastify";
export declare class ServerContext {
    req: FastifyRequest;
    res: FastifyReply;
    type?: () => ClazzType<any>;
    constructor(req: FastifyRequest, res?: FastifyReply, type?: () => ClazzType<any>);
}
export interface Guard {
    /**
     * canActivate 메소드는 요청을 처리하기 전에 실행됩니다.
     *
     * @param context
     */
    canActivate(context: ServerContext): Promise<boolean> | boolean;
}
export declare const USE_GUARD_OPTION_TOKEN = "USE_GUARD_CLASS_TOKEN";
export declare function UseGuard<T extends Guard = Guard>(...guards: ClazzType<T>[]): MethodDecorator;
