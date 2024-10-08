import { DataSource, DataSourceOptions } from "typeorm";
/**
 * @class DataSourceFactory
 */
export declare class DataSourceProxy {
    private readonly options;
    private readonly logger;
    private readonly transactionScanner;
    constructor(options: DataSourceOptions);
    /**
     * 데이터베이스 연결을 생성합니다.
     */
    create(): DataSource;
    /**
     * Creates a repository proxy.
     *
     * @param entity
     * @param target Specify the DataSource instance
     * @param prop
     * @returns
     */
    private createRepositoryProxy;
    /**
     *
     * @param target
     * @param prop
     * @param receiver
     * @returns
     */
    private query;
    private getQueryRunner;
    /**
     * QueryRunner를 생성합니다.
     *
     *
     * @param dataSource
     * @param target
     * @returns
     */
    private createQueryRunner;
    /**
     * EntityManager에 접근합니다.
     *
     * @param manager
     * @returns
     */
    private createEntityManagerProxy;
}
