/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType } from "@stingerloom/core/common";
import { FindOption } from "../dialects/FindOption";
import { BaseRepository } from "./BaseRepository";
import { EntityResult } from "../types/EntityResult";

export abstract class BaseEntityManager {
    /**
     * 이 메서드는 데이터베이스에 연결하고 엔티티를 등록합니다.
     * 엔티티 등록이라 함은 데이터베이스에 테이블을 생성하거나 업데이트하는 작업을 의미합니다.
     * 이를 동기화 작업이라고 부릅니다.
     *
     * 이 메서드는 애플리케이션이 시작될 때 한 번만 호출되어야 합니다.
     * RDBMS의 경우, 동기화를 위해 DDL 명령이 수행될 수 있으므로 주의가 필요합니다.
     */
    abstract register(): Promise<void>;
    /**
     * 데이터베이스에 연결합니다.
     * 가용할 데이터베이스 드라이버에 연결하고 데이터소스를 만듭니다.
     */
    abstract connect(): Promise<void>;
    /**
     * 소멸자로 주로 메모리 해제 작업을 수행합니다.
     * 서버가 어떠한 이유로 인해 종료될 때 호출됩니다.
     * 통합 테스트 환경에서는 이 메서드가 빈번하게 호출될 수 있습니다.
     */
    abstract propagateShutdown(): Promise<void>;
    /**
     * 데이터베이스 쿼리를 수행하여 결과를 1건 반환합니다.
     * 쿼리는 where, order by, limit 절을 포함할 수 있습니다.
     * @param entity
     * @param findOption
     */
    abstract findOne<T>(
        entity: ClazzType<T>,
        findOption: FindOption<T>,
    ): Promise<EntityResult<T>>;
    /**
     * 데이터베이스 쿼리를 수행하여 결과를 여러 건 반환합니다.
     * 쿼리는 where, order by, limit 절을 포함할 수 있습니다.
     * @param entity
     * @param findOption
     */
    abstract find<T>(
        entity: ClazzType<T>,
        findOption: FindOption<T>,
    ): Promise<EntityResult<T>>;

    /**
     * 데이터베이스에 데이터를 저장하거나 수정합니다.
     * 수정 시에는 PK 컬럼이 존재해야하고, 없을 경우 저장 작업을 수행합니다.
     *
     * 본 ORM에는 아직 영속성 컨텍스트 같은 1차 캐시 스토어가 없습니다.
     * 따라서 저장이나 변경 수행 시, dirty checking을 수행하지 않습니다.
     *
     * 따라서 본 메서드가 호출되면 데이터베이스에 즉시 반영됩니다.
     *
     * @param entity
     * @param item
     */
    abstract save<T>(
        entity: ClazzType<T>,
        item: Partial<T>,
    ): Promise<InstanceType<ClazzType<T>>>;

    /**
     * 주어진 Entity에 해당하는 Repository를 반환합니다.
     * 본 ORM은 Active Record Pattern은 지원하지 않기 떄문에,
     * Repository를 통하는 Data Mapper Pattern을 이용해야 합니다.
     */
    abstract getRepository<T>(entity: ClazzType<T>): BaseRepository<T>;
}
