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
    const instanceScanner = Container.get(InstanceScanner);

    if (ReflectManager.isRepository(target)) {
        const database = instanceScanner.get(Database) as Database;
        const entity = ReflectManager.getRepositoryEntity(target);

        const repository = database.getRepository(entity);

        // const proxy = new Proxy(repository, {
        //     get: (target, prop) => {
        //         // createQueryBuilder의 SelectQueryBuilder의 getOne 메서드를 호출할 때
        //         // 결과를 plainToClass로 변환합니다.
        //         if (prop === "getOne") {
        //             // eslint-disable-next-line @typescript-eslint/no-explicit-any
        //             return async (...args: any[]) => {
        //                 const result = await Reflect.get(target, prop)(...args);
        //                 return plainToClass(entity, result);
        //             };
        //         }

        //         return Reflect.get(target, prop);
        //     },
        //     set: (target, prop, value) => {
        //         Reflect.set(target, prop, value);
        //         return true;
        //     },
        // });

        return repository;
    } else if (ReflectManager.isInjectable(target)) {
        const injectable = instanceScanner.get(target);

        return injectable;
    }

    return target;
};
