/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatabaseContext } from "./interfaces/DatabaseContext";
import { DatabaseOptions } from "./interfaces/DatabaseOptions";
import { DatabaseAdapterFactory } from "./factory/DatabaseAdapterFactory";
import { OnApplicationShutdown } from "../OnApplicationShutdown";
import { Logger } from "../Logger";

/**
 * 데이터베이스 클래스
 * 적절한 어댑터를 사용하여 데이터베이스 작업을 추상화합니다.
 */
class Database implements OnApplicationShutdown {
    private readonly logger: Logger = new Logger(Database.name);
    private adapter: DatabaseContext;

    constructor(options: DatabaseOptions) {
        if (!options) {
            throw new Error("Database configuration is required.");
        }
        this.adapter = DatabaseAdapterFactory.create(options);
    }

    /**
     * 데이터베이스 연결을 초기화합니다.
     */
    public async start(): Promise<void> {
        await this.adapter.start();
    }

    /**
     * 서버가 종료될 때 실행되는 함수입니다.
     */
    async onApplicationShutdown(): Promise<void> {
        await this.adapter.onApplicationShutdown();
    }

    /**
     * 원본 데이터베이스 연결을 반환합니다.
     */
    public getNativeConnection(): any {
        return this.adapter.getNativeConnection();
    }

    /**
     * 엔티티에 대한 리포지토리를 반환합니다.
     * @param entity 엔티티 클래스
     */
    public getRepository<T>(entity: new () => T): any {
        return this.adapter.getRepository(entity);
    }
}

export default Database;
