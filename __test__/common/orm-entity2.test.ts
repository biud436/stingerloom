import "reflect-metadata";
import {
    Controller,
    Get,
    Module,
    ModuleOptions,
    OnModuleInit,
} from "@stingerloom/common";
import {
    Column,
    Entity,
    InjectEntityManager,
    PrimaryGeneratedColumn,
} from "@stingerloom/orm/decorators";
import configService from "@stingerloom/common/ConfigService";
import { EntityManager } from "@stingerloom/orm/core/EntityManager";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { DataSourceOptions } from "typeorm";
import axios from "axios";
import { ServerBootstrapApplication } from "@stingerloom/bootstrap/ServerBootstrapApplication";

describe("테스트", () => {
    let application: TestServerApplication;

    // TODO: typeorm의 의존성을 제거해야 함
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

    /**
     * 상품 엔티티
     */
    @Entity()
    class Product {
        @PrimaryGeneratedColumn()
        id!: number;

        @Column({
            length: 255,
            nullable: false,
            type: "varchar",
        })
        name!: string;

        @Column({
            type: "int",
            nullable: false,
            length: 11,
            // default: 0,
        })
        price!: number;
    }

    @Controller("/")
    class AppController implements OnModuleInit {
        constructor(
            @InjectEntityManager()
            private readonly entityManager: EntityManager,
        ) {}

        async onModuleInit(): Promise<void> {}

        @Get("/hello")
        async resolvePerson() {
            const productRepository = this.entityManager.getRepository(Product);

            const product = new Product();
            product.name = "테스트 상품";
            product.price = 10000;

            const result = await productRepository.save(product);

            console.log("myresult", result);

            return "Hello, World!";
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

    it("Hello, World!", async () => {
        const { data } = await axios.get("http://localhost:3002/hello");

        expect(data).toBe("Hello, World!");
    });
});
