/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataSource, EntityManager, QueryResult, QueryRunner } from "typeorm";
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";

/**
 * This adapter is used to get some features for the transaction in the TypeORM.
 *
 * @class QueryRunnerAdapter
 * @author biud436
 */
export class QueryRunnerAdapter {
  private queryRunner?: QueryRunner;

  constructor(private readonly dataSource: DataSource) {
    this.queryRunner = this.dataSource.createQueryRunner();
  }

  /**
   * Creates/uses database connection from the connection pool to perform further operations.
   * Returns obtained database connection.
   */
  public async connect(): Promise<any> {
    return await this.queryRunner?.connect();
  }

  /**
   * Starts transaction.
   *
   * @param isolationLevel Specify what isolation level you want to use for this transaction.
   */
  public async startTransaction(
    isolationLevel?: IsolationLevel | undefined,
  ): Promise<void> {
    await this.queryRunner?.startTransaction(isolationLevel);
  }

  /**
   * Commits transaction.
   */
  public async commitTransaction(): Promise<void> {
    await this.queryRunner?.commitTransaction();
  }

  /**
   * Rollbacks transaction.
   */
  public async rollbackTransaction(): Promise<void> {
    await this.queryRunner?.rollbackTransaction();
  }

  /**
   * Releases used database connection.
   * You cannot use query runner methods after connection is released.
   */
  public async release(): Promise<void> {
    await this.queryRunner?.release();
  }

  /**
   * Gets the manager from existing queryRunner.
   * it retrieved via QueryRunner will be used in the transaction.
   */
  public getManager(): EntityManager | undefined {
    return this.queryRunner?.manager;
  }

  /**
   * Executes a given SQL query and returns raw database results.
   */
  query(query: string, parameters?: any[]): Promise<any>;
  query(
    query: string,
    parameters: any[] | undefined,
    useStructuredResult: true,
  ): Promise<QueryResult>;

  public async query(
    query: string,
    parameters?: any[] | undefined,
    useStructuredResult?: true,
  ): Promise<any> {
    return await this.queryRunner?.query(
      query,
      parameters,
      useStructuredResult!,
    );
  }
}
