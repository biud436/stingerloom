import { Controller } from "@stingerloom/common/decorators/Controller";
import { Get } from "@stingerloom/common/decorators/Get";
import { Header } from "@stingerloom/common/decorators/Header";
import { InternalServerException } from "@stingerloom/error/InternalServerException";
import { Point } from "../../entity/Point";
import { OnModuleInit } from "@stingerloom/common";
import { DatabaseClient } from "@stingerloom/common/orm/DatabaseClient";
import configService from "@stingerloom/common/ConfigService";
import { MySqlDriver } from "@stingerloom/common/orm/dialects/mysql/MySqlDriver";

/**
 * @class PostController
 */
@Controller("/post")
export class PostController implements OnModuleInit {
    constructor(private readonly point: Point) {}

    async onModuleInit() {
        const client = DatabaseClient.getInstance();

        const connector = await client.connect({
            host: configService.get<string>("DB_HOST"),
            port: configService.get<number>("DB_PORT"),
            database: configService.get<string>("DB_NAME"),
            password: configService.get<string>("DB_PASSWORD"),
            username: configService.get<string>("DB_USER"),
            type: "mysql",
            entities: [],
            logging: true,
        });

        const driver = new MySqlDriver(connector);

        const userInformation = await driver.getSchemas("test.user");

        // await driver.addColumn("test.user", "age", "int");
        // await driver.dropColumn("test.user", "age");

        console.log(userInformation);
    }

    /**
     * @returns
     */
    @Header("Content-Type", "application/json")
    @Get()
    public async getPost() {
        throw new InternalServerException(
            "포스트를 읽는 중 오류가 발생하였습니다",
        );
    }

    @Get("/point")
    async getPoint() {
        this.point.move(4, 4);

        return {
            x: this.point.x,
            y: this.point.y,
        };
    }
}
