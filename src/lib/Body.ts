/* eslint-disable @typescript-eslint/no-explicit-any */

import { ClazzType } from "./RouterMapper";

export type BodyParameter = {
    index: number;
    type: ClazzType<any>;
};

/* eslint-disable @typescript-eslint/no-unused-vars */
export const BODY_TOKEN = "body";
export function Body(): ParameterDecorator {
    return (target, propertyKey, index) => {
        const className = target.constructor.name;
        const methodName = propertyKey as string;
        const parameterIndex = index;

        const paramTypes = Reflect.getMetadata(
            "design:paramtypes",
            target,
            methodName,
        ) as any;

        // 몇번째 매개변수 인지 마킹
        Reflect.defineMetadata(
            BODY_TOKEN,
            {
                index,
                type: paramTypes[index],
            } as BodyParameter,
            target,
            methodName,
        );
    };
}
