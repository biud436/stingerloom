/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import Container from "typedi";
import Database from "./Database";
import { ClazzType } from "./RouterMapper";
import { RepositoryScanner } from "./RepositoryScanner";

export const REPOSITORY_TOKEN = "repository";
export function InjectRepository<T>(entity: ClazzType<T>): ParameterDecorator {
    const dataSource = Database.getDataSource();

    const repository = dataSource.getRepository(entity);

    return (target, propertyKey, index) => {
        const params = Reflect.getMetadata("design:paramtypes", target);
        const injectParam = params[index];

        Reflect.defineMetadata(
            REPOSITORY_TOKEN,
            repository,
            injectParam.prototype,
        );
    };
}
