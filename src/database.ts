import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import configService from "./lib/ConfigService";
import Container, { Service } from "typedi";
import { User } from "./entity/User";
import bcrypt from "bcrypt";

const option = <DataSourceOptions>{
    type: "mariadb",
    host: configService.get<string>("DB_HOST"),
    port: configService.get<number>("DB_PORT"),
    database: configService.get<string>("DB_NAME"),
    password: configService.get<string>("DB_PASSWORD"),
    username: configService.get<string>("DB_USER"),
    entities: [__dirname + "/entity/*.ts"],
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: true,
    logging: true,
};

@Service()
class Database {
    private dataSource: DataSource;

    constructor() {
        this.dataSource = new DataSource(option);
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
