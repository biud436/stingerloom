/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { ControllerScanner, MetadataScanner } from "./MetadataScanner";
import { ObjectLiteral, Repository } from "typeorm";

export function Controller(path: string): ClassDecorator {
    return function (target: any) {
        const scanner = Container.get(ControllerScanner);
        const metadataScanner = Container.get(MetadataScanner);

        const params = Reflect.getMetadata("design:paramtypes", target) || [];

        // 리포지토리 주입을 위해 매개변수를 스캔합니다.
        const repositoies: Repository<ObjectLiteral>[] = [];
        params.forEach((param: any, index: number) => {
            const repository = Reflect.getMetadata(
                "repository",
                param.prototype,
            );

            if (repository) {
                repositoies.push(repository);
            }
        });

        // 컨트롤러 메타데이터를 등록합니다.
        const name = target.name + "_" + scanner.createUniqueKey();
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
