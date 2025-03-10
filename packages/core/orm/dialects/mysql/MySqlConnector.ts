/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql, { Pool, PoolConnection } from "mysql2";
import sql, { Sql } from "sql-template-tag";
import { Logger } from "@stingerloom/core/common/Logger";
import { Connection } from "../../core/Connection";
import { TRANSACTION_ISOLATION_LEVEL } from "../IsolationLevel";
import { ConnectionNotFound } from "./ConnectionNotFound";
import { PoolNotFound } from "./PoolNotFound";
import { DatabaseClientOptions } from "../../core/DatabaseClientOptions";
import { IConnector } from "../../core/IConnector";
export type Entity = any;
export type IDatabaseType = "mysql" | "mariadb" | "postgres" | "sqlite";

export class MySqlConnector implements IConnector {
  pool?: Pool;
  private isDebug = false;
  private readonly logger = new Logger("MySqlConnector");

  async connect(options: DatabaseClientOptions): Promise<void> {
    try {
      const pool = mysql.createPool({
        host: options.host,
        user: options.username,
        password: options.password,
        database: options.database,
        port: options.port,
        dateStrings: options.datesStrings,
        connectionLimit: options.connectionLimit ?? 10,
        charset: options.charset ?? "utf8mb4",
      });

      this.isDebug = !!options.logging;

      this.pool = pool;
    } catch (e: unknown) {
      throw new Error(`MySQL 연결에 실패했습니다. ${e}`);
    }
  }

  /**
   * 트랜잭션 처리를 위해 커넥션 풀에서 커넥션을 하나 가져옵니다.
   */
  async getConnection(): Promise<PoolConnection> {
    if (!this.pool) {
      throw new PoolNotFound();
    }

    return new Promise((resolve, reject) => {
      this.pool?.getConnection((error, connection) => {
        if (error) {
          reject(error);
        }

        resolve(connection);
      });
    });
  }

  async runTestSql(): Promise<void> {
    if (!this.pool) {
      return;
    }

    await this.query(sql`SELECT 1 + 1`);
  }

  async query(sql: string, connection?: Connection): Promise<any>;
  async query({ sql, values }: Sql, connection?: Connection): Promise<any>;
  async query(rawSql: Sql | string, connection?: Connection): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.pool) {
        return;
      }

      const qb = connection ? connection : this.pool;

      if (typeof rawSql === "string") {
        qb.query(rawSql, (error, results, fields) => {
          if (error) {
            reject(error);
          }

          if (this.isDebug) {
            this.logger.info(`Query: ${rawSql}`);
          }

          if (connection) {
            resolve({ results, fields, error });
          } else {
            resolve(results);
          }
        });
      } else {
        const { sql, values } = rawSql;

        qb.query(sql, values, (error, results, fields) => {
          if (error) {
            reject(error);
          }

          if (this.isDebug) {
            this.logger.info(`Query: ${sql}, # ${JSON.stringify(values)}`);
            this.logger.info(`Results: ${results}`);
            this.logger.info(`Error: ${JSON.stringify(error)}`);
          }

          if (connection) {
            resolve({ results, fields, error });
          } else {
            resolve(results);
          }
        });
      }
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.pool) {
        return;
      }

      this.pool.end((error) => {
        if (error) {
          reject(error);
        }

        resolve();
      });
    });
  }

  async setTransactionIsolationLevel(
    connection: Connection,
    level: TRANSACTION_ISOLATION_LEVEL,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!connection) {
        reject(new ConnectionNotFound());
      }

      /**
       * 커넥션에 설정된 트랜잭션 격리 수준은 해당 커넥션에서 수행되는 모든 트랜잭션에만 적용됨
       */
      connection.query(`SET TRANSACTION ISOLATION LEVEL ${level}`, (error) => {
        if (error) {
          reject(error);
        }

        resolve();
      });
    });
  }

  async startTransaction(
    connection: Connection,
    level: TRANSACTION_ISOLATION_LEVEL = "READ COMMITTED",
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!connection) {
        reject(new ConnectionNotFound());
      }

      this.setTransactionIsolationLevel(connection, level)
        .then(() => {
          connection.beginTransaction((error) => {
            if (error) {
              reject(error);
            }

            resolve();
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async rollback(connection: Connection): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!connection) {
        reject(new ConnectionNotFound());
      }

      connection.rollback(() => {
        connection.release();
        resolve();
      });
    });
  }

  async commit(connection: Connection): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!connection) {
        reject(new ConnectionNotFound());
      }

      connection.commit((error) => {
        if (error) {
          connection.rollback(() => {
            connection.release();
            reject(error);
          });
        }

        connection.release();
        resolve();
      });
    });
  }
}
