import { IDatabaseType, Entity } from "../mysql/Connector";

export interface DatabaseClientOptions {
    type: IDatabaseType;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize: boolean;
    logging: boolean;
    entities: Entity[];
    datesStrings: boolean /** MySQL Only */;
    connectionLimit: number /** MySQL Only */;
    charset: string /** MySQL Only */;

    /**
     * SQL을 출력할지 여부
     */
    printSql: boolean;
}
