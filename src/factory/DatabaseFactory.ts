import { DataSourceOptions } from "typeorm";

import { IFactory } from "./IFactory";
import { DatabaseContext } from "./DatabaseContext";
import { DBConnection } from "./DBConnection";

export type DBConnectionOption = DataSourceOptions;

class DatabaseFactory implements IFactory<DBConnection> {
    protected option = DatabaseContext.getConfig();

    public create(): DBConnection {
        return new DBConnection(this.option as DBConnectionOption);
    }
}

export const databaseFactory = new DatabaseFactory();
