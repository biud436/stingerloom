import { IDatabaseType, Entity } from "../dialects/mysql/MySqlConnector";

export interface DatabaseClientOptions {
    type: IDatabaseType;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    synchronize?: boolean;
    logging?: boolean;
    entities: Entity[];
    datesStrings?: boolean /** MySQL Only */;
    connectionLimit?: number /** MySQL Only */;
    charset?: string /** MySQL Only */;
}
