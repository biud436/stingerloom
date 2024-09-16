import { ClazzType, ReflectManager } from "@stingerloom/common";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const MANY_TO_ONE_TOKEN = Symbol.for("MANY_TO_ONE");

export type EntityLike<T = any> = { new (): T };
export type RetrieveEntity = () => EntityLike;
export type SetRelatedEntity<T extends EntityLike> = (entity: T) => void;

export type ManyToOneOption = {
    /**
     * 데이터베이스에서 컬럼의 값을 가져올 때, 오브젝트에 매핑되는 컬럼의 타입을 변환할 수 있는 함수입니다.
     */
    transform?: <T = any>(raw: unknown) => T;
};

export type ManyToOneMetadata = {
    target: ClazzType<unknown>;
    type: EntityLike;

    columnName: string;

    /**
     * 연관관계의 엔티티를 가져오는 함수입니다
     */
    getMappingEntity: RetrieveEntity;

    /**
     * 매핑할 엔티티를 가져오는 함수입니다
     */
    getMappingProperty: SetRelatedEntity<EntityLike>;

    option?: ManyToOneOption;
};

/**
 * ManyToOne 관계를 설정합니다.
 * 연관관계에서 주인이 되는 엔티티에 설정해야 합니다.
 *
 * @example
 *
 * @ManyToOne(() => User, (entity) => entity.user)
 * user: User;
 */
export function ManyToOne(
    getMappingEntity: RetrieveEntity,
    getMappingProperty: SetRelatedEntity<EntityLike>,
    option?: ManyToOneOption,
): PropertyDecorator {
    return (target, propertyKey) => {
        const injectParam = ReflectManager.getType<any>(target, propertyKey);

        const columnName = propertyKey.toString();
        const metadata = <ManyToOneMetadata>{
            target,
            type: injectParam,
            columnName,
            getMappingEntity,
            getMappingProperty,
            option,
        };

        const columns = Reflect.getMetadata(MANY_TO_ONE_TOKEN, target);

        Reflect.defineMetadata(
            MANY_TO_ONE_TOKEN,
            [...(columns || []), metadata],
            target,
        );

        // 스캐너가 따로 있어야 할까?
    };
}
