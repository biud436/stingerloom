import { ClazzType } from "../common";
import { FastifyRequest } from "fastify";
/**
 * @class GuardConsumer
 * @description
 * 이 클래스는 가드를 실행하기 위한 컨슈머 클래스입니다.
 */
export declare class GuardConsumer {
    private readonly logger;
    create(req: FastifyRequest, targetController: ClazzType<any>, routerName: string): Promise<void>;
}
