/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType, HEADER_TOKEN } from "@stingerloom/common";
import { FastifyReply } from "fastify";

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
