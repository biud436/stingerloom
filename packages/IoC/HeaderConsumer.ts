/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType, HEADER_TOKEN } from "@stingerloom/common";
import { FastifyReply } from "fastify";

/**
 * @class HeaderConsumer
 * @description
 * 이 클래스는 헤더를 설정하기 위한 컨슈머 클래스입니다.
 */
export class HeaderConsumer {
    constructor(private readonly targetController: ClazzType<unknown>) {}

    public execute(res: FastifyReply, routerName: string) {
        const { targetController } = this;

        // Header Consumer
        const header = Reflect.getMetadata(
            HEADER_TOKEN,
            targetController,
            routerName,
        );
        if (header) {
            res.header(header.key, header.value);
        }
    }
}
