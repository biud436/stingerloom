/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sql } from "sql-template-tag";
import { DatabaseClient } from "../DatabaseClient";
import { IConnector } from "../core/IConnector";
import { MySqlDataSource } from "./mysql/MySqlDataSource";
import { IDataSource } from "./IDataSource";
import { Logger } from "@stingerloom/core/common";
import { DatabaseConnectionFailedError } from "@stingerloom/core/error/DatabaseConnectionFailedError";
import { DatabaseNotConnectedError } from "@stingerloom/core/error/DatabaseNotConnectedError";
import { IQueryEngine } from "./IQueryEngine";
import { TRANSACTION_ISOLATION_LEVEL } from "./IsolationLevel";

/**
 * The `TransactionHolder` class extends the `IQueryEngine` and is responsible for managing
 * database transactions and connections. It provides methods to connect to the database,
 * execute queries, and handle transactions.
 */
export class TransactionHolder extends IQueryEngine {
  private connection?: IConnector;
  private dataSource?: IDataSource;
  private readonly logger: Logger = new Logger(TransactionHolder.name);

  /**
   * Constructs a new instance of the `TransactionHolder` class.
   */
  constructor() {
    super();
  }

  /**
   * Establishes a connection to the database and initializes the data source.
   *
   * @throws {DatabaseConnectionFailedError} If the connection to the database fails.
   */
  public async connect() {
    try {
      this.connection = await DatabaseClient.getInstance().getConnection();
      this.dataSource = new MySqlDataSource(this.connection);
      await this.dataSource.createConnection();
    } catch (error: unknown) {
      throw new DatabaseConnectionFailedError();
    }
  }

  /**
   * Executes a SQL query on the connected database.
   *
   * @param sql - The SQL query string or `Sql` object to be executed.
   * @returns The result of the query.
   * @throws {DatabaseNotConnectedError} If there is no active database connection.
   */
  public async query(sql: string): Promise<any>;
  public async query<T = any>(sql: Sql): Promise<T>;
  public async query<T = any>(sql: string | Sql): Promise<T> {
    if (!this.connection) {
      throw new DatabaseNotConnectedError();
    }
    const queryResult = await this.dataSource?.query(sql as string);

    return queryResult;
  }

  /**
   * Starts a new transaction with the specified isolation level.
   *
   * @param level - The isolation level for the transaction. Defaults to "READ COMMITTED".
   * @returns A promise that resolves when the transaction is started.
   * @throws {DatabaseNotConnectedError} If there is no active database connection.
   */
  public async startTransaction(
    level: TRANSACTION_ISOLATION_LEVEL = "READ COMMITTED",
  ) {
    if (!this.connection) {
      throw new DatabaseNotConnectedError();
    }

    return this.dataSource?.startTransaction(level);
  }

  /**
   * Rolls back the current transaction.
   *
   * @returns A promise that resolves when the transaction is rolled back.
   */
  public async rollback() {
    return this.dataSource?.rollback();
  }

  /**
   * Commits the current transaction.
   *
   * @returns A promise that resolves when the transaction is committed.
   */
  public async commit() {
    return this.dataSource?.commit();
  }

  /**
   * Creates a savepoint with the given name in the current transaction.
   *
   * @param name - The name of the savepoint.
   * @returns A promise that resolves when the savepoint is created.
   */
  public async savepoint(name: string) {
    return this.dataSource?.savepoint(name);
  }

  /**
   * Rolls back the current transaction to the specified savepoint.
   *
   * @param name - The name of the savepoint to roll back to.
   * @returns A promise that resolves when the transaction is rolled back to the savepoint.
   */
  public async rollbackTo(name: string) {
    return this.dataSource?.rollbackTo(name);
  }

  /**
   * Closes the current database connection.
   *
   * @throws {DatabaseNotConnectedError} If there is no active database connection.
   */
  public async close() {
    if (!this.connection) {
      throw new DatabaseNotConnectedError();
    }

    await this.dataSource?.close();
  }
}
