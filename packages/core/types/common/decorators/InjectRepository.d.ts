import "reflect-metadata";
import { ClazzType } from "../RouterMapper";
export declare class RepositoryMetadata {
    token: string;
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
export declare const REPOSITORY_TOKEN = "repository";
export declare const REPOSITORY_ENTITY_METADATA = "repository:metadata";
/**
 * Repository를 주입받을 수 있는 ParameterDecorator입니다.
 *
 * @function InjectRepository
 * @param entity
 * @returns
 */
export declare function InjectRepository<T>(entity: ClazzType<T>): ParameterDecorator;
