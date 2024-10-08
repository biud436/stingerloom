import { ClazzType } from "../common";
import { FastifyReply } from "fastify";
/**
 * @class RenderConsumer
 * @description
 * 이 클래스는 HTML을 렌더링하기 위한 컨슈머 클래스입니다.
 */
export declare class RenderConsumer {
    private readonly targetController;
    constructor(targetController: ClazzType<unknown>);
    /**
     * 렌더링을 해야 한다면 true를 반환합니다.
     * @param routerName
     * @returns
     */
    isRender(routerName: string): boolean;
    /**
     * 렌더링을 수행합니다.
     *
     * @param res
     * @param routerName
     * @param result
     * @returns
     */
    execute(res: FastifyReply, routerName: string, result: unknown): any;
}
