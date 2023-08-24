import { DataSource } from "typeorm";

import bcrypt from "bcrypt";
import { databaseFactory } from "@stingerloom/factory/DatabaseFactory";
import { User } from "@stingerloom/example/entity/User";

import { ModuleOptions } from "./ModuleOptions";

/**
 * @class Database
 * @description
 * 데이터베이스 연결을 관리하는 TypeORM을 위한 클래스입니다.
 */
class Database {
    private dataSource: DataSource;

    constructor(options: ModuleOptions["configuration"]) {
        this.dataSource = databaseFactory.create(options);
    }

    /**
     * 서버를 시작합니다.
     */
    public async start() {
        await this.dataSource.initialize();
    }

    /**
     * 데이터 소스를 반환합니다.
     * @returns
     */
    public getDataSource(): DataSource {
        return this.dataSource;
    }

    /**
     * 리포지토리를 반환합니다.
     *
     * @param entity
     * @returns
     */
    public getRepository<T>(entity: new () => T) {
        return this.dataSource.getRepository(entity);
    }

    /**
     * 테스트 용도로 사용하는 에코 유저 함수입니다.
     * @returns
     */
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
