import { DataSource } from "typeorm";

import { databaseFactory } from "@stingerloom/core/factory/database/DatabaseFactory";

import { ModuleOptions } from "../ModuleOptions";
import { OnApplicationShutdown } from "../OnApplicationShutdown";
import { Logger } from "../Logger";

class Database implements OnApplicationShutdown {
    private readonly logger: Logger = new Logger(Database.name);
    private dataSource: DataSource;

    constructor(options: ModuleOptions["configuration"]) {
        if (!options) {
            throw new Error("Database configuration is required.");
        }
        this.dataSource = databaseFactory.create(options);
    }

    /**
     * 서버를 시작합니다.
     */
    public async start() {
        if (!this.dataSource.isInitialized) {
            await this.dataSource.initialize();
        }
    }

    /**
     * 서버가 종료될 때 실행되는 함수입니다.
     */
    async onApplicationShutdown(): Promise<void> {
        if (this.dataSource.isInitialized) {
            this.logger.warn("Closing database connection.");
            await this.dataSource.destroy();
        }
    }

    /**
     * 데이터 소스를 반환합니다.
     * @returns
     */
    public getDataSource(): DataSource {
        return this.dataSource;
    }

    /**
     * 리포지토리를 반환합니다.
     *
     * @param entity
     * @returns
     */
    public getRepository<T>(entity: new () => T) {
        const metadata = this.dataSource.getMetadata(entity);
        const isTreeEntity = metadata.treeType !== undefined;
        const isMongoEntity = this.dataSource.options.type === "mongodb";

        return isTreeEntity
            ? this.dataSource.getTreeRepository(entity)
            : isMongoEntity
              ? this.dataSource.getMongoRepository(entity)
              : this.dataSource.getRepository(entity);
    }
}

export default Database;
