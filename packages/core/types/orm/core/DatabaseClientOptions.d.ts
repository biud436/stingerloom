import { IDatabaseType, Entity } from "../dialects/mysql/MySqlConnector";
export interface DatabaseClientOptions {
    type: IDatabaseType;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    /**
     * 동기화 여부.
     * 이 옵션을 true로 설정하면 테이블이 없을 경우 자동으로 생성합니다.
     */
    synchronize?: boolean;
    logging?: boolean;
    entities: Entity[];
    datesStrings?: boolean /** MySQL Only */;
    connectionLimit?: number /** MySQL Only */;
    charset?: string /** MySQL Only */;
}
