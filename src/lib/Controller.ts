/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { DynamicClassWrapper, MetadataScanner } from "./MetadataScanner";
import { ControllerScanner } from "./ControllerScanner";
import { REPOSITORY_TOKEN } from "./InjectRepository";
import { createUniqueControllerKey } from "../utils/scanner";

export function Controller(path: string): ClassDecorator {
    return function (target: any) {
        const scanner = Container.get(ControllerScanner);
        const metadataScanner = Container.get(MetadataScanner);

        const params = Reflect.getMetadata("design:paramtypes", target) || [];

        // 리포지토리 주입을 위해 매개변수를 스캔합니다.
        const repositoies: DynamicClassWrapper<any>[] = [];
        params.forEach((param: any, index: number) => {
            const repository = Reflect.getMetadata(
                REPOSITORY_TOKEN,
                param.prototype,
            );

            if (repository) {
                repositoies.push(repository);
            }
        });

        // 컨트롤러 메타데이터를 등록합니다.
        const name = createUniqueControllerKey(target.name, scanner);
        scanner.set(name, {
            path,
            target,
            routers: metadataScanner.allMetadata(),
            repositoies,
        });

        metadataScanner.clear();

        return target;
    };
}
