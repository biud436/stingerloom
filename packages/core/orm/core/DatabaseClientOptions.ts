import { IDatabaseType, Entity } from "../dialects/mysql/MySqlConnector";

/**
 * Configuration options for database client connection.
 */
export interface DatabaseClientOptions {
    /** Type of the database to connect to */
    type: IDatabaseType;

    /** Database server host address */
    host: string;

    /** Port number for the database connection */
    port: number;

    /** Username for database authentication */
    username: string;

    /** Password for database authentication */
    password: string;

    /** Name of the database to connect to */
    database: string;

    /**
     * Enable/disable schema synchronization.
     * If set to true, tables will be automatically created if they don't exist.
     */
    synchronize?: boolean;

    /** Enable/disable query logging */
    logging?: boolean;

    /** Array of entity classes that will be used by the connection */
    entities: Entity[];

    /** MySQL Only: Forces date types to be returned as strings */
    datesStrings?: boolean;

    /** MySQL Only: Maximum number of connections in the pool */
    connectionLimit?: number;

    /** MySQL Only: The charset for the connection */
    charset?: string;
}
