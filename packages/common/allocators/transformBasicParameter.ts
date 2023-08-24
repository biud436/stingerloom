import Container from "typedi";

import { ReflectManager } from "../ReflectManager";
import { InstanceScanner } from "@stingerloom/IoC";
import Database from "../Database";

/**
 * 기본 파라미터를 특정 타입으로 변환하는 기능을 가지는 함수입니다.
 * 예를 들면, `@InjectRepository` 데코레이터를 사용할 때 타입을 변환하는 기능을 가지고 있습니다.
 *
 * @param target
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const transformBasicParameter = (target: any) => {
    if (ReflectManager.isRepository(target)) {
        const instanceScanner = Container.get(InstanceScanner);
        const database = instanceScanner.get(Database) as Database;
        const entity = ReflectManager.getRepositoryEntity(target);

        const repository = database.getRepository(entity);

        return repository;
    }

    return target;
};
