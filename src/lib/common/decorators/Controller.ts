/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import {
    ContainerMetadata,
    DynamicClassWrapper,
    MetadataScanner,
} from "../../IoC/scanners/MetadataScanner";
import { ControllerScanner } from "../../IoC/scanners/ControllerScanner";
import { REPOSITORY_TOKEN } from "./InjectRepository";
import { createUniqueControllerKey } from "../../../utils/scanner";
import { InstanceScanner } from "../../IoC/scanners/InstanceScanner";
import { ParameterListManager } from "../ParameterListManager";
import { ReflectManager } from "../ReflectManager";

export function Controller(path: string): ClassDecorator {
    return function (target: any) {
        const scanner = Container.get(ControllerScanner);
        const metadataScanner = Container.get(MetadataScanner);

        const params = ReflectManager.getParamTypes(target) || [];

        // 매개변수 주입을 위해 매개변수를 스캔합니다.
        const parameters: DynamicClassWrapper<any>[] = [];
        params.forEach((param: any, index: number) => {
            const targetName = param.name;

            ParameterListManager.invoke(targetName)?.(param, parameters);
        });

        // 컨트롤러 메타데이터를 등록합니다.
        const name = createUniqueControllerKey(target.name, scanner);
        scanner.set(name, {
            path,
            target,
            routers: metadataScanner.allMetadata(),
            type: "controller",
            parameters: parameters,
        });

        metadataScanner.clear();

        return target;
    };
}
