/* eslint-disable @typescript-eslint/no-explicit-any */
import { plainToClass } from "class-transformer";

export declare type MyClassConstructor<T> = {
    new (...args: any[]): T;
};

export function deserializeEntity<T, V extends object>(
    cls: MyClassConstructor<T>,
    plain: V | V[],
    options?: {
        // 클래스에 존재하지 않는 속성을 제외합니다
        excludeExtraneousValues?: boolean;

        groups?: string[];
        version?: number;
        enableCircularCheck?: boolean;
        exposeDefaultValues?: boolean;

        // 데코레이터가 없는 속성을 노출할지 여부
        exposeUnsetProperties?: boolean;
    },
): T {
    return plainToClass(cls, plain, {
        /**
         * true면 클래스에 정의되지 않은 속성을 제외합니다.
         */
        excludeExtraneousValues: false,
        ...options,
    });
}
