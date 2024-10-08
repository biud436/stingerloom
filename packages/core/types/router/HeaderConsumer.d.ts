import { ClazzType } from "../common";
import { FastifyReply } from "fastify";
/**
 * @class HeaderConsumer
 * @description
 * 이 클래스는 헤더를 설정하기 위한 컨슈머 클래스입니다.
 */
export declare class HeaderConsumer {
    private readonly targetController;
    constructor(targetController: ClazzType<unknown>);
    execute(res: FastifyReply, routerName: string): void;
}
