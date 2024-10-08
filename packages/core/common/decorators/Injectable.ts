/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { DynamicClassWrapper } from "@stingerloom/core/IoC/scanners/MetadataScanner";
import { ParameterListManager } from "../ParameterListManager";
import { createUniqueInjectableKey } from "@stingerloom/core/utils/scanner";
import { InjectableScanner } from "@stingerloom/core/IoC/scanners/InjectableScanner";

export const INJECTABLE_TOKEN = "injectable";
export function Injectable(): ClassDecorator {
    return function (target: any) {
        const metadata = {
            type: "injectable",
            name: target.name,
            target,
        };

        Reflect.defineMetadata(INJECTABLE_TOKEN, metadata, target);

        const params = Reflect.getMetadata("design:paramtypes", target) || [];

        // 매개변수 주입을 위해 매개변수를 스캔합니다.
        const parameters: DynamicClassWrapper<any>[] = [];
        params.forEach((param: any, index: number) => {
            const targetName = param.name;

            ParameterListManager.invoke(targetName)?.(param, parameters);
        });

        // 스캐너가 스캔할 수 있도록 Injectable한 객체와 매개변수를 등록합니다.
        const scanner = Container.get(InjectableScanner);
        const name = createUniqueInjectableKey(target.name, scanner);
        scanner.set(name, {
            name,
            target,
            parameters,
            type: "injectable",
        });

        return target;
    };
}
