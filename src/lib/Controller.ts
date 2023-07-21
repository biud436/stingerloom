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
