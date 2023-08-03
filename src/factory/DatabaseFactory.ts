import { DataSource, DataSourceOptions } from "typeorm";

import { IFactory } from "./IFactory";
import { DatabaseContext } from "./DatabaseContext";

class DatabaseFactory implements IFactory<DataSource> {
    protected option = DatabaseContext.getConfig();

    constructor() {}

    public create(): DataSource {
        return new DataSource(this.option as DataSourceOptions);
    }
}

export const databaseFactory = new DatabaseFactory();
