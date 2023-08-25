/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */

export type Optional<T> = {
    [P in keyof T]?: T[P];
};

export namespace ResultUtils {
    export type Result<T> = {
        message: string;
        result: "success" | "failure";
        data: T;
    };

    export function successWrap<T = any>(data: Optional<Result<T>>) {
        return {
            ...data,
            result: "success",
        };
    }

    export function success<T>(message: string, data: T) {
        return {
            message,
            result: "success",
            data,
        };
    }
}
