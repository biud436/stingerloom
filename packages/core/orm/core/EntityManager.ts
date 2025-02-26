/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import { ClazzType, Logger, ReflectManager } from "@stingerloom/core/common";
import { ColumnMetadata, EntityMetadata, EntityScanner } from "../scanner";
import Container from "typedi";
import { DatabaseClient } from "../DatabaseClient";
import { MySqlDriver } from "../dialects/mysql/MySqlDriver";
import { ISqlDriver } from "../dialects/SqlDriver";
import { INDEX_TOKEN, IndexMetadata } from "../decorators/Indexer";
import { IDatabaseType } from "../dialects/mysql/MySqlConnector";
import { TransactionHolder } from "../dialects/TransactionHolder";
import { FindOption } from "../dialects/FindOption";
import { IDataSource } from "../dialects/IDataSource";
import { MySqlDataSource } from "../dialects/mysql/MySqlDataSource";
import sql, { Sql, join, raw } from "sql-template-tag";
import {
    ENTITY_TOKEN,
    MANY_TO_ONE_TOKEN,
    ManyToOneMetadata,
} from "../decorators";
import { BaseRepository } from "./BaseRepository";
import { BaseEntityManager } from "./BaseEntityManager";
import { ResultSetHeader } from "mysql2";
import { EntityNotFound } from "../dialects/EntityNotFound";
import { QueryResult } from "../types/QueryResult";
import { EntityResult } from "../types/EntityResult";
import { RawQueryBuilderFactory } from "./RawQueryBuilderFactory";
import { Conditions } from "./Conditions";
import { ResultTransformerFactory } from "./ResultTransformerFactory";
import configService from "@stingerloom/core/common/ConfigService";
// import { DatabaseClientOptions } from "./DatabaseClientOptions";
// import { DATABASE_OPTION_TOKEN, DatabaseModule } from "../DatabaseModule";

export class EntityManager implements BaseEntityManager {
    private _entities: ClazzType<any>[] = [];
    private readonly logger = new Logger(EntityManager.name);
    private driver?: ISqlDriver;
    private dataSource?: IDataSource;
    private dirtyEntities: Set<InstanceType<ClazzType<any>>> = new Set();

    public async register() {
        await this.connect();
        await this.registerEntities();
    }

    get client() {
        return DatabaseClient.getInstance();
    }

    get connection() {
        return this.client.getConnection();
    }

    public async connect() {
        const client = this.client;

        // const options = () =>
        //     Reflect.getMetadata(
        //         DATABASE_OPTION_TOKEN,
        //         DatabaseModule,
        //     ) as DatabaseClientOptions;

        // if (!options()) {
        //     throw new Error("Database options does not exist.");
        // }

        // const connector = await client.connect(options);

        const connector = await client.connect({
            host: configService.get<string>("DB_HOST"),
            port: configService.get<number>("DB_PORT"),
            database: configService.get<string>("DB_NAME"),
            password: configService.get<string>("DB_PASSWORD"),
            username: configService.get<string>("DB_USER"),
            type: "mysql",
            entities: [],
            logging: true,
            synchronize: true,
        });

        switch (client.type as IDatabaseType) {
            case "mysql":
                this.driver = new MySqlDriver(connector, client.type);
                this.dataSource = new MySqlDataSource(connector);
                break;
            default:
                throw new Error("Unsupported database type.");
        }
    }

    public async propagateShutdown() {
        // TODO: 나중에 추가
    }

    getNameStrategy<T>(clazz: ClazzType<T>): string {
        return clazz.name;
    }

    /**
     * 변경 감지를 위한 프록시 객체를 생성합니다.
     */
    private createProxy<T>(entity: T): T {
        return new Proxy(entity as any, {
            set: (target: any, prop: string, value: any) => {
                target[prop] = value;

                // Set 자료구조에 변경된 엔티티를 추가합니다.
                this.dirtyEntities.add(target);
                return true;
            },
        });
    }

    private async registerEntities() {
        const entityScanner = Container.get(EntityScanner);
        const entities = entityScanner.makeEntities();

        let entity: IteratorResult<EntityMetadata>;

        const { synchronize } = this.client.getOptions();

        while ((entity = entities.next())) {
            if (entity.done) {
                break;
            }

            const metadata = entity.value as EntityMetadata;

            const TargetEntity = metadata.target as ClazzType<any>;
            let tableName = metadata.name;
            if (!tableName) {
                tableName = this.getNameStrategy(TargetEntity);
            }

            if (!ReflectManager.isEntity(TargetEntity)) {
                throw new Error(`${tableName} is not an Entity.`);
            }

            // 동기화 옵션이 켜져있을 경우에만 동작합니다.
            if (synchronize) {
                // DB에 테이블이 존재하지 않으면 새로운 테이블을 생성합니다.
                const hasTable = await this.driver?.hasTable(tableName);
                if (!hasTable || hasTable.length === 0) {
                    // TODO: TargetEntity.name에 직접 접근하지 말고, 전략에 따라 접근해야 합니다.
                    await this.driver?.createTable(tableName, metadata.columns);
                }

                // 외래키를 생성합니다.
                await this.registerForeignKeys(TargetEntity, tableName);

                // 인덱스를 생성합니다.
                await this.registerIndex(TargetEntity, tableName);
            }
        }
    }

    private async registerForeignKeys(
        TargetEntity: ClazzType<any>,
        tableName: string,
    ) {
        // 엔티티 매니저를 가지고 옵니다.
        const entityScanner = Container.get(EntityScanner);

        // ManyToOne 관계를 가져옵니다.
        const manyToOneItems = Reflect.getMetadata(
            MANY_TO_ONE_TOKEN,
            TargetEntity.prototype,
        ) as ManyToOneMetadata<any>[];

        const isValidManyToOne = manyToOneItems && manyToOneItems.length > 0;

        // ManyToOne 관계가 존재할 경우, 외래키를 생성합니다.
        if (isValidManyToOne) {
            for (const manyToOneItem of manyToOneItems) {
                const { joinColumn } = manyToOneItem;

                // 매핑할 엔티티를 가져옵니다.
                const mappingEntity = manyToOneItem.getMappingEntity();
                if (!mappingEntity) {
                    throw new EntityNotFound(mappingEntity);
                }
                // Search for metadata.
                const mappingTableMetadata = entityScanner.scan(mappingEntity);
                if (!mappingTableMetadata) {
                    throw new Error(
                        "Metadata for the mapping entity does not exist.",
                    );
                }

                if (!joinColumn) {
                    throw new Error("JoinColumn does not exist.");
                }

                // Get the primary key of the mapping table.
                const mappingTablePrimaryKey =
                    mappingTableMetadata.columns.find(
                        (e) => e.options?.primary,
                    )?.name;

                // Throw an error if the primary key does not exist.
                if (!mappingTablePrimaryKey) {
                    throw new Error(
                        "Primary key for the mapping entity does not exist.",
                    );
                }

                const mappingTableName = mappingEntity.name;

                await this.driver?.addForeignKey(
                    // 현재 테이블 이름
                    tableName,
                    // 현재 테이블의 키 이름
                    joinColumn,
                    // 매핑할 테이블 이름
                    mappingTableName,
                    // 매핑할 테이블의 기본키
                    mappingTablePrimaryKey,
                );
            }
        }
    }

    /**
     * 인덱스를 생성합니다.
     *
     * @param TargetEntity
     * @param tableName
     */
    private async registerIndex(
        TargetEntity: ClazzType<any>,
        tableName: string,
    ) {
        const indexer = Reflect.getMetadata(
            INDEX_TOKEN,
            TargetEntity.prototype,
        ) as IndexMetadata[];
        if (indexer) {
            for (const index of indexer) {
                const indexName = `INDEX_${tableName}_${index.name}`;

                const indexes = (await this.driver?.getIndexes(
                    tableName,
                )) as any[];

                let isExist = false;
                for (const idx of indexes || []) {
                    if (idx["Key_name"] === indexName) {
                        isExist = true;
                        break;
                    }
                }

                if (!isExist) {
                    await this.driver?.addIndex(
                        tableName,
                        index.name,
                        indexName,
                    );
                }
            }
        }
    }

    /**
     * find out a single entity from the database.
     *
     * @param entity
     * @param findOption
     * @returns
     */
    async findOne<T>(
        entity: ClazzType<T>,
        findOption: FindOption<T>,
    ): Promise<EntityResult<T>> {
        return this.find<T>(entity, {
            ...findOption,
            limit: 1,
        });
    }

    /**
     * Find out entities from the database.
     *
     * @param entity
     * @param findOption
     * @returns
     */
    async find<T>(
        entity: ClazzType<T>,
        findOption: FindOption<T>,
    ): Promise<EntityResult<T>> {
        const { select, orderBy, where, take } = findOption;
        const { limit } = findOption;

        const transactionHolder = new TransactionHolder();
        const resultTransformer = ResultTransformerFactory.create();

        try {
            // 트랜잭션을 시작합니다.
            await transactionHolder.connect();
            await transactionHolder.startTransaction();
            await transactionHolder.query("SET autocommit = 0");

            // 메타데이터를 가져옵니다.
            const metadata = Reflect.getMetadata(
                ENTITY_TOKEN,
                entity,
            ) as EntityMetadata;

            if (!metadata) {
                throw new Error("Entity metadata does not exist.");
            }

            // factory class로부터 QueryBuilder를 생성합니다.
            const qb = RawQueryBuilderFactory.create();

            // Query Map
            const selectMap: string[] = [];
            const whereMap: Sql[] = [];
            const orderByMap: Array<{
                column: string;
                direction: "ASC" | "DESC";
            }> = [];

            if (!select) {
                selectMap.push(
                    ...metadata.columns.map((column) => column.name!),
                );
            }

            for (const key in where) {
                const value = where[key];
                if (value) {
                    whereMap.push(Conditions.equals(key, value));
                }
            }

            for (const key in orderBy) {
                const value = orderBy[key];
                if (value) {
                    orderByMap.push({
                        column: key,
                        direction: value,
                    });
                }
            }

            // Query를 구성합니다.
            qb.select(selectMap)
                .from(metadata.name!)
                .where(whereMap)
                .orderBy(orderByMap);

            // LIMIT 쿼리가 튜플일 경우
            if (Array.isArray(limit)) {
                let [offset, count] = limit;

                if (offset < 0) {
                    offset = 0;
                }

                if (count < 0) {
                    count = 0;
                }

                if (count === 0) {
                    count = 1;
                }

                if (take && take > 0) {
                    count = take;
                }

                if (this.isMySqlFamily()) {
                    qb.setDatabaseType("mysql");
                }

                qb.limit([offset, count]);
            } else {
                qb.limit(limit as number);
            }

            // 최종 SQL을 생성합니다.
            const resultQuery = qb.build();

            const queryResult = (await transactionHolder.query<T>(
                resultQuery,
            )) as QueryResult;

            // 트랜잭션을 커밋합니다.
            await transactionHolder.commit();

            const { results } = queryResult;
            if (!results || results.length === 0) {
                return undefined;
            }

            if (results.length > 1) {
                return resultTransformer.toEntities(entity, queryResult);
            } else {
                return resultTransformer.toEntity(entity, queryResult);
            }
        } catch (e: unknown) {
            // 트랜잭션 롤백
            await transactionHolder.rollback();
        } finally {
            // 트랜잭션 종료
            await transactionHolder.close();
        }
    }

    /**
     * 백틱으로 감싸지 않은 컬럼 이름을 백틱으로 감싸서 반환합니다.
     */
    wrap(columnName: string) {
        return `\`${columnName}\``;
    }

    private isMySqlFamily() {
        return ["mysql", "mariadb"].includes(this.client.type as IDatabaseType);
    }

    /**
     * 업데이트 쿼리
     */
    async save<T>(
        entity: ClazzType<T>,
        item: Partial<T>,
    ): Promise<InstanceType<ClazzType<T>>> {
        const metadata = Reflect.getMetadata(
            ENTITY_TOKEN,
            entity,
        ) as EntityMetadata;

        if (!metadata) {
            throw new Error("Entity metadata does not exist.");
        }

        const transactionHolder = new TransactionHolder();

        try {
            await transactionHolder.connect();
            await transactionHolder.startTransaction();

            await transactionHolder.query("SET autocommit = 0");

            const columns = metadata.columns.map((column) => {
                return raw(column.name!);
            });

            const values = metadata.columns.map((column: ColumnMetadata) => {
                return (item as any)[column.name!];
            });

            const pk = metadata.columns.find(
                (column: ColumnMetadata) => column.options?.primary,
            );

            const pkValue = (item as any)[pk.name!];

            // If the primary key (PK) does not exist, create a new entity.
            if (!pkValue) {
                const packet = (await transactionHolder.query<T>(
                    sql`
                        INSERT INTO ${raw(this.wrap(metadata.name!))}
                        (${join(columns, ", ")})
                        VALUES (${join(values, ", ")})
                    `,
                )) as { results: ResultSetHeader; fields: any };

                await transactionHolder.commit();

                if (this.isMySqlFamily()) {
                    const result = await this.findOne(entity, {
                        where: {
                            [pk.name!]: packet?.results?.insertId,
                        },
                    } as any);

                    return result as T;
                }

                return packet as T;
            }

            // If the primary key (PK) exists, execute the update query.
            const updateMap = metadata.columns.map((column: ColumnMetadata) => {
                return sql`${raw(column.name!)} = ${(item as any)[column.name!]}`;
            });

            await transactionHolder.query<T>(
                sql`
                    UPDATE ${raw(this.wrap(metadata.name!))}
                    SET ${join(updateMap, ", ")}
                    WHERE ${raw(pk.name!)} = ${pkValue}
                `,
            );

            await transactionHolder.commit();

            // Retrieve and return the updated entity.
            const result = await this.findOne(entity, {
                where: {
                    [pk.name!]: pkValue,
                },
            } as any);

            return result as T;
        } catch (e: unknown) {
            await transactionHolder.rollback();
        } finally {
            await transactionHolder.close();
        }

        return {} as T;
    }

    getRepository<T>(entity: ClazzType<T>) {
        return BaseRepository.of(entity, this);
    }
}
