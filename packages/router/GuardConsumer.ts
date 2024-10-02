/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ClazzType,
    Guard,
    Logger,
    ServerContext,
    USE_GUARD_OPTION_TOKEN,
} from "@stingerloom/common";
import Container from "typedi";
import { InstanceScanner } from "../ioc/scanners";
import { FastifyRequest } from "fastify";
import { UnauthorizedException } from "@stingerloom/error";

/**
 * @class GuardConsumer
 * @description
 * 이 클래스는 가드를 실행하기 위한 컨슈머 클래스입니다.
 */
export class GuardConsumer {
    private readonly logger = new Logger(GuardConsumer.name);

    public async create(
        req: FastifyRequest,
        targetController: ClazzType<any>,
        routerName: string,
    ) {
        // Guard Consumer
        const isControllerGuard = Reflect.getMetadata(
            USE_GUARD_OPTION_TOKEN,
            targetController,
        );
        const isMethodGuard =
            Reflect.getMetadata(
                USE_GUARD_OPTION_TOKEN,
                targetController,
                routerName,
            ) !== undefined;

        if (isControllerGuard || isMethodGuard) {
            this.logger.info("가드가 있습니다.");

            const raw = isControllerGuard
                ? Reflect.getMetadata(USE_GUARD_OPTION_TOKEN, targetController)
                : Reflect.getMetadata(
                      USE_GUARD_OPTION_TOKEN,
                      targetController,
                      routerName,
                  );

            const instanceScanner = Container.get(InstanceScanner);
            const guards = raw.map((guard: any) => {
                const guardInstance = instanceScanner.wrap(guard) as Guard;

                if (!guardInstance.canActivate) {
                    throw new Error(
                        `${guard.name}은 canActivate 메소드가 없습니다.`,
                    );
                }

                return guardInstance;
            });

            for (const guard of guards) {
                const context = new ServerContext(req);
                const result = await guard.canActivate(context);

                if (!result) {
                    throw new UnauthorizedException("접근 권한이 없습니다.");
                }
            }
        }
    }
}
