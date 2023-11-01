import { ServerBootstrapApplication } from "@stingerloom/bootstrap";
import {
    Controller,
    Get,
    Module,
    ModuleOptions,
    Query,
} from "@stingerloom/common";
import { DataSourceOptions } from "typeorm";
import configService from "@stingerloom/common/ConfigService";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import axios from "axios";
import { IsNumber, IsString } from "class-validator";
import { Transform } from "class-transformer";

describe("Query 테스트", () => {
    let application: TestServerApplication;
    const option: DataSourceOptions = {
        type: "mariadb",
        host: configService.get<string>("DB_HOST"),
        port: configService.get<number>("DB_PORT"),
        database: configService.get<string>("DB_NAME"),
        password: configService.get<string>("DB_PASSWORD"),
        username: configService.get<string>("DB_USER"),
        entities: [__dirname + "/entity/*.ts", __dirname + "/entity/map/*.ts"],
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: true,
        logging: true,
    };

    class Point {
        private x: number;
        private y: number;

        constructor(args: string) {
            const [x, y] = args.split(",");

            this.x = parseInt(x, 10);
            this.y = parseInt(y, 10);
        }

        getX() {
            return this.x;
        }

        getY() {
            return this.y;
        }
    }

    class Person {
        @IsString()
        id!: string;

        @IsString()
        name!: string;

        @IsNumber()
        @Transform(({ value }) => parseInt(value, 10))
        age!: number;
    }

    @Controller("/")
    class AppController {
        @Get("/blog")
        async resolveIdAndTitle(
            @Query("id") id: number,
            @Query("title") title: string,
        ) {
            return { id, title };
        }

        @Get("/point")
        async resolveNameAndTitle(@Query("point") point: Point) {
            return { x: point.getX(), y: point.getY() };
        }

        @Get("/person")
        async resolvePerson(@Query() person: Person) {
            return person;
        }
    }

    @Module({
        controllers: [AppController],
        providers: [],
    })
    class TestServerApplication extends ServerBootstrapApplication {
        override beforeStart(): void {
            this.moduleOptions = ModuleOptions.merge({
                controllers: [],
                providers: [],
                configuration: option,
            });
        }
    }

    beforeAll((done) => {
        application = new TestServerApplication();
        application.on("start", () => {
            done();
        });

        application.start();
    });

    afterAll(async () => {
        await application.stop();
    });

    it("쿼리 매개변수를 정수형으로 변환하는가? -- 1", async () => {
        const { data } = await axios.get(
            "http://localhost:3002/blog?id=1&title=2",
        );
        expect(data).toEqual({ id: 1, title: "2" });
    });

    it("쿼리 매개변수를 객체형으로 변환하는가? -- 2", async () => {
        const { data } = await axios.get(
            "http://localhost:3002/point?point=1,2",
        );

        console.log(data);

        expect(data).toEqual({ x: 1, y: 2 });
    });

    it("쿼리 매개변수 생략 시, DTO 객체로 변환되는가?", async () => {
        const { data } = await axios.get(
            "http://localhost:3002/person?id=1&name=아저씨&age=10",
        );

        console.log(data);

        expect(data).toEqual({ id: "1", name: "아저씨", age: 10 });
    });
});
