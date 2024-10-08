/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "typedi";

import { ReflectManager } from "../ReflectManager";
import { InstanceScanner } from "@stingerloom/core/IoC";
import Database from "../Database";
import { DataSource } from "typeorm";
import { BadRequestException } from "@stingerloom/core/error";
import { EntityManager } from "@stingerloom/core/orm/core";

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
    } else if (ReflectManager.isEntityManager(target)) {
        const entityManager = instanceScanner.get(EntityManager);
        return entityManager;
    } else if (ReflectManager.isInjectable(target)) {
        const injectable = instanceScanner.get(target);

        // 순황 의존성 참조가 발생하는 경우 에러를 발생시킵니다.
        if (!injectable) {
            throw new BadRequestException(
                `Cannot create an instance of ${target.name}. Please check for circular dependencies or double-check the module loading order.`,
            );
        }

        return injectable;
    }

    return target;
};
