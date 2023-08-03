import { DataSource } from "typeorm";
import Container, { Service } from "typedi";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import { databaseFactory } from "../factory/DatabaseFactory";

@Service()
class Database {
    private dataSource: DataSource;

    constructor() {
        this.dataSource = databaseFactory.create();
    }

    public async start() {
        await this.dataSource.initialize();
    }

    public getDataSource(): DataSource {
        return this.dataSource;
    }

    /**
     * 커넥션 테스트 용 데이터를 생성합니다.
     *
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
export default Container.get(Database);
