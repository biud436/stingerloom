/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";
import { DynamicClassWrapper } from "../../IoC/scanners/MetadataScanner";
import { REPOSITORY_TOKEN } from "./InjectRepository";
import { InstanceScanner } from "../../IoC/scanners/InstanceScanner";

export const INJECTABLE_TOKEN = "injectable";
export function Injectable(): ClassDecorator {
    return function (target) {
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

            switch (targetName) {
                case "Repository":
                    {
                        const repository = Reflect.getMetadata(
                            REPOSITORY_TOKEN,
                            param.prototype,
                        );
                        parameters.push(repository);
                    }
                    break;
                default:
                    {
                        const TargetService = param;

                        const instanceScanner = Container.get(InstanceScanner);

                        if (TargetService) {
                            parameters.push(
                                instanceScanner.wrap(TargetService),
                            );
                        }
                    }
                    break;
            }
        });

        return target;
    };
}
