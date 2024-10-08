import { DataSource } from "typeorm";
import { ModuleOptions } from "./ModuleOptions";
import { OnApplicationShutdown } from "./OnApplicationShutdown";
declare class Database implements OnApplicationShutdown {
    private readonly logger;
    private dataSource;
    constructor(options: ModuleOptions["configuration"]);
    /**
     * 서버를 시작합니다.
     */
    start(): Promise<void>;
    /**
     * 서버가 종료될 때 실행되는 함수입니다.
     */
    onApplicationShutdown(): Promise<void>;
    /**
     * 데이터 소스를 반환합니다.
     * @returns
     */
    getDataSource(): DataSource;
    /**
     * 리포지토리를 반환합니다.
     *
     * @param entity
     * @returns
     */
    getRepository<T>(entity: new () => T): import("typeorm").Repository<import("typeorm").ObjectLiteral> | import("typeorm").MongoRepository<import("typeorm").ObjectLiteral>;
}
export default Database;
