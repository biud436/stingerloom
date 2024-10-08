/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType, RENDER_PATH_TOKEN, RENDER_TOKEN } from "../common";
import { FastifyReply } from "fastify";

/**
 * @class RenderConsumer
 * @description
 * 이 클래스는 HTML을 렌더링하기 위한 컨슈머 클래스입니다.
 */
export class RenderConsumer {
    constructor(private readonly targetController: ClazzType<unknown>) {}

    /**
     * 렌더링을 해야 한다면 true를 반환합니다.
     * @param routerName
     * @returns
     */
    public isRender(routerName: string) {
        const { targetController } = this;

        const render = Reflect.getMetadata(
            RENDER_TOKEN,
            targetController,
            routerName,
        );

        return !!render;
    }

    /**
     * 렌더링을 수행합니다.
     *
     * @param res
     * @param routerName
     * @param result
     * @returns
     */
    public execute(res: FastifyReply, routerName: string, result: unknown) {
        const { targetController } = this;

        if (this.isRender(routerName)) {
            const path = Reflect.getMetadata(
                RENDER_PATH_TOKEN,
                targetController,
                routerName,
            );

            const resExtend = res as any;
            if (resExtend.view) {
                return resExtend.view(path, result);
            }
        }

        return res.send(result);
    }
}
