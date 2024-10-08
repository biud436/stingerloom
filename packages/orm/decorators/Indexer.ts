/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReflectManager } from "@stingerloom/core/common/ReflectManager";

export interface IndexOption {
    name?: string;
}

export interface IndexMetadata {
    target: any;
    name: string;
    type: any;
}

export const INDEX_TOKEN = Symbol.for("INDEX");

export function Index(): PropertyDecorator {
    return (target, propertyKey) => {
        const injectParam = ReflectManager.getType<any>(target, propertyKey);

        const indexes = Reflect.getMetadata(INDEX_TOKEN, target);

        console.log("target", target);

        Reflect.defineMetadata(
            INDEX_TOKEN,
            [
                ...(indexes || []),
                {
                    target,
                    name: propertyKey.toString(),
                    type: injectParam,
                },
            ],
            target,
        );
    };
}
