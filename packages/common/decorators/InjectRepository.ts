/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import { ClazzType } from "../RouterMapper";
import { ReflectManager } from "../ReflectManager";

export class RepositoryMetadata {
    token!: string;
}

export const REPOSITORY_TOKEN = "repository";
export const REPOSITORY_ENTITY_METADATA = "repository:metadata";
export function InjectRepository<T>(entity: ClazzType<T>): ParameterDecorator {
    return (target, _propertyKey, index) => {
        const params = ReflectManager.getParamTypes(target) || [];
        const injectParam = params[index] as ClazzType<T>;

        const fakeRepository = new RepositoryMetadata();
        fakeRepository.token = "REPOSITORY";

        // Entity 메타데이터 설정
        Reflect.defineMetadata(
            REPOSITORY_ENTITY_METADATA,
            entity,
            injectParam.prototype,
        );

        // Repository (deprecated될 예정)
        Reflect.defineMetadata(
            REPOSITORY_TOKEN,
            fakeRepository,
            injectParam.prototype,
        );
    };
}
