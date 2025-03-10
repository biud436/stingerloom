/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DataSource,
  Repository,
  TreeRepository,
  MongoRepository,
  EntityTarget,
  ObjectLiteral,
} from "typeorm";
import { Logger } from "../../Logger";
import { DatabaseContext, DatabaseOptions } from "../interfaces";

/**
 * TypeORM을 위한 데이터베이스 어댑터 구현
 */
export class TypeOrmDatabaseAdapter implements DatabaseContext {
  private readonly logger: Logger = new Logger(TypeOrmDatabaseAdapter.name);
  private dataSource: DataSource;

  constructor(options: DatabaseOptions) {
    if (!options) {
      throw new Error("Database configuration is required.");
    }
    this.dataSource = new DataSource(options as any);
  }

  /**
   * 데이터베이스 연결을 초기화합니다.
   */
  public async start(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
      this.logger.info("TypeORM database connection initialized");
    }
  }

  /**
   * 서버가 종료될 때 실행되는 함수입니다.
   */
  async onApplicationShutdown(): Promise<void> {
    if (this.dataSource.isInitialized) {
      this.logger.warn("Closing TypeORM database connection.");
      await this.dataSource.destroy();
    }
  }

  /**
   * TypeORM 데이터소스를 반환합니다.
   */
  public getNativeConnection(): DataSource {
    return this.dataSource;
  }

  /**
   * 엔티티에 대한 리포지토리를 반환합니다.
   * @param entity 엔티티 클래스
   */
  public getRepository<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
  ): Repository<T> | TreeRepository<T> | MongoRepository<T> {
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
