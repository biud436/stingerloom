import Container from "typedi";

import { ReflectManager } from "../ReflectManager";
import { InstanceScanner } from "@stingerloom/IoC";
import Database from "../Database";

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const transformBasicParameter = (target: any) => {
    if (ReflectManager.isRepository(target)) {
        const instanceScanner = Container.get(InstanceScanner);
        const database = instanceScanner.get(Database) as Database;
        const dataSource = database.getDataSource();
        const entity = ReflectManager.getRepositoryEntity(target);

        const repository = dataSource.getRepository(entity);

        return repository;
    }

    return target;
};
