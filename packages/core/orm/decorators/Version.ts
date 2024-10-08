/* eslint-disable @typescript-eslint/no-explicit-any */
import { Column } from "./Column";

export const VERSION_TOKEN = Symbol.for("VERSION");

/**
 * 낙관적 락을 위한 버전 컬럼을 설정합니다.
 */
export function Version(): PropertyDecorator {
    return (target) => {
        Reflect.defineMetadata(VERSION_TOKEN, true, target);

        /**
         * bigint 핸들러가 아직 없어서 int로 설정합니다.
         */
        return Column({
            type: "int",
            nullable: false,
            length: 11,
        });
    };
}
