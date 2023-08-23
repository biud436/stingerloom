/* eslint-disable @typescript-eslint/no-explicit-any */

import { ReflectManager } from "../ReflectManager";
import { ClazzType } from "../RouterMapper";

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

        const paramTypes = ReflectManager.getParamTypes(target, methodName)!;

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
