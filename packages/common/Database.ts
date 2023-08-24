import { DataSource } from "typeorm";

import bcrypt from "bcrypt";
import { databaseFactory } from "@stingerloom/factory/DatabaseFactory";
import { User } from "@stingerloom/example/entity/User";

import { ModuleOptions } from "./ModuleOptions";

class Database {
    private dataSource: DataSource;

    constructor(options: ModuleOptions["configuration"]) {
        this.dataSource = databaseFactory.create(options);
    }

    public async start() {
        await this.dataSource.initialize();
    }

    public getDataSource(): DataSource {
        return this.dataSource;
    }

    public async echoUser() {
        const repository = this.dataSource.getRepository(User);

        await repository.clear();

        const user = new User();
        user.name = "test";
        user.password = bcrypt.hashSync("test1234", 10);
        user.score = 10;

        return await repository.save(user);
    }
}

export default Database;
