/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";

import { ReflectManager } from "../ReflectManager";
import { InstanceScanner } from "@stingerloom/IoC";
import Database from "../Database";
import { DataSource } from "typeorm";

/**
 * 기본 파라미터를 특정 타입으로 변환하는 기능을 가지는 함수입니다.
 * 예를 들면, `@InjectRepository` 데코레이터를 사용할 때 타입을 변환하는 기능을 가지고 있습니다.
 *
 * @param target
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const transformBasicParameter = (
    target: any,
    injector?: any,
    index?: number,
) => {
    const instanceScanner = Container.get(InstanceScanner);

    if (ReflectManager.isRepository(target)) {
        const database = instanceScanner.get(Database) as Database;
        const entity = ReflectManager.getRepositoryEntity(
            target,
            injector,
            index,
        );

        const repository = database.getRepository(entity);

        return repository;
    } else if (target === DataSource) {
        const database = instanceScanner.get(Database) as Database;
        return database.getDataSource();
    } else if (ReflectManager.isInjectable(target)) {
        const injectable = instanceScanner.get(target);

        return injectable;
    }

    return target;
};
