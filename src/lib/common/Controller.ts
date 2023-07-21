/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { ControllerScanner, MetadataScanner } from "./MetadataScanner";
import { CONTROLLER_TOKEN } from "./RouterMapper";

export function Controller(path: string): ClassDecorator {
    return function (target: any) {
        const scanner = Container.get(ControllerScanner);
        const metadataScanner = Container.get(MetadataScanner);

        Reflect.defineMetadata(CONTROLLER_TOKEN, target.name, {});

        const name = target.name + "_" + scanner.createUniqueKey();
        scanner.set(name, {
            path,
            target,
            routers: metadataScanner.allMetadata(),
        });

        metadataScanner.clear();

        return target;
    };
}
