import { Controller } from "@stingerloom/common/decorators/Controller";
import { Get } from "@stingerloom/common/decorators/Get";
import { Header } from "@stingerloom/common/decorators/Header";
import { InternalServerException } from "@stingerloom/error/InternalServerException";
import { Point } from "../../entity/Point";
import { OnModuleInit } from "@stingerloom/common";
/**
 * @class PostController
 */
@Controller("/post")
export class PostController implements OnModuleInit {
    constructor(private readonly point: Point) {}

    async onModuleInit() {
        // const userInformation = await driver.getSchemas("test.user");
        // await driver.addColumn("test.user", "age", "int");
        // await driver.dropColumn("test.user", "age");
        // console.log(userInformation);
        // const hasCollection = await driver.hasCollection("user");
        // console.log(hasCollection);
        // await driver.createCollection("node", [
        //     {
        //         name: "id",
        //         options: {
        //             type: "int" as ColumnType,
        //             nullable: false,
        //             length: 11,
        //             primary: true,
        //         },
        //     },
        //     {
        //         name: "name",
        //         options: {
        //             type: "varchar" as ColumnType,
        //             nullable: false,
        //             length: 255,
        //         },
        //     },
        //     {
        //         name: "age",
        //         options: {
        //             type: "int" as ColumnType,
        //             nullable: false,
        //             length: 11,
        //         },
        //     },
        // ]);
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
