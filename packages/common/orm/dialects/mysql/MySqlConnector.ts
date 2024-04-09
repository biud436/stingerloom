/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql, { Pool } from "mysql2";
import sql, { Sql } from "sql-template-tag";
import { DatabaseClientOptions } from "../../types/DatabaseClientOptions";
import { IConnector } from "../../types/IConnector";
import { Logger } from "@stingerloom/common/Logger";
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

    async runTestSql(): Promise<void> {
        if (!this.pool) {
            return;
        }

        await this.query(sql`SELECT 1 + 1`);
    }

    async query(sql: string): Promise<any>;
    async query({ sql, values }: Sql): Promise<any>;
    async query(rawSql: Sql | string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!this.pool) {
                return;
            }

            if (typeof rawSql === "string") {
                this.pool.query(rawSql, (error, results) => {
                    if (error) {
                        reject(error);
                    }

                    if (this.isDebug) {
                        this.logger.info(`Query: ${rawSql}`);
                    }

                    resolve(results);
                });
            } else {
                const { sql, values } = rawSql;

                this.pool.query(sql, values, (error, results) => {
                    if (error) {
                        reject(error);
                    }

                    if (this.isDebug) {
                        this.logger.info(
                            `Query: ${sql}, #-- ${JSON.stringify(values)} --#`,
                        );
                    }

                    resolve(results);
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
}
