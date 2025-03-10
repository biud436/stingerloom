/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "reflect-metadata";
import { ClazzType } from "../RouterMapper";
import { ReflectManager } from "../ReflectManager";

export class RepositoryMetadata {
  token!: string;
}

export interface RepositoryMetadataItem {
  /**
   * 엔티티 명
   */
  name: string;

  /**
   * 엔티티
   */
  entity: ClazzType<any>;

  /**
   * 매개변수 인덱스
   */
  index: number;

  /**
   * 매개변수
   */
  params: ClazzType<any>[];

  /**
   * 타겟
   */
  target?: any;
}

export const REPOSITORY_TOKEN = "repository";
export const REPOSITORY_ENTITY_METADATA = "repository:metadata";

/**
 * Repository를 주입받을 수 있는 ParameterDecorator입니다.
 *
 * @function InjectRepository
 * @param entity
 * @returns
 */
export function InjectRepository<T>(entity: ClazzType<T>): ParameterDecorator {
  return (target, _propertyKey, index) => {
    const params = ReflectManager.getParamTypes(target) || [];
    const injectParam = params[index] as ClazzType<T>;

    const fakeRepository = new RepositoryMetadata();
    fakeRepository.token = "REPOSITORY";

    const previousItem =
      Reflect.getMetadata(REPOSITORY_ENTITY_METADATA, injectParam.prototype) ??
      [];

    // Create a repository.
    const repository = {
      name: entity.name,
      entity: entity,
      index: index,
      params,
      target: target as any,
    } as RepositoryMetadataItem;

    let items = [repository];

    if (previousItem && previousItem.length > 0) {
      items = [...previousItem, ...items];
    }

    // Entity 메타데이터 설정
    Reflect.defineMetadata(
      REPOSITORY_ENTITY_METADATA,
      items,
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
