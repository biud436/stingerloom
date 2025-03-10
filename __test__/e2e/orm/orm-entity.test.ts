/* eslint-disable @typescript-eslint/no-unused-vars */

import { ServerBootstrapApplication } from "@stingerloom/core/bootstrap";
import {
  Controller,
  Get,
  Module,
  ModuleOptions,
  OnModuleInit,
} from "@stingerloom/core/common";
import configService from "@stingerloom/core/common/ConfigService";
import axios from "axios";
import { Entity } from "@stingerloom/core/orm/decorators/Entity";
import {
  Column,
  InjectEntityManager,
  PrimaryGeneratedColumn,
} from "@stingerloom/core/orm/decorators";
import { Index } from "@stingerloom/core/orm/decorators/Indexer";
import { EntityManager } from "@stingerloom/core/orm/core";
import { DatabaseModule } from "@stingerloom/core/orm/DatabaseModule";

describe("커스텀 ORM 테스트", () => {
  let application: TestServerApplication;

  @Entity()
  class MyNode {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
      length: 255,
      nullable: false,
      type: "varchar",
    })
    name!: string;

    @Column({
      length: 255,
      nullable: false,
      type: "varchar",
    })
    type!: string;

    @Column({
      length: 255,
      nullable: false,
      type: "varchar",
    })
    @Index()
    description!: string;
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
      const nodeRepository = this.entityManager.getRepository(MyNode);

      const node = await nodeRepository.findOne({
        where: {
          id: 1,
        },
        orderBy: {
          id: "ASC",
        },
      });

      console.log("node", node);

      if (!node) {
        await nodeRepository.save({
          description: "test2",
          name: "test",
          type: "test",
        });
      }

      const node2 = await nodeRepository.save({
        id: 1,
        description: "test5",
        name: "test",
        type: "test",
      });

      console.log("node2", node2);

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
        imports: [
          DatabaseModule.forRoot({
            type: "mariadb",
            host: configService.get<string>("DB_HOST"),
            port: configService.get<number>("DB_PORT"),
            database: configService.get<string>("DB_NAME"),
            password: configService.get<string>("DB_PASSWORD"),
            username: configService.get<string>("DB_USER"),
            entities: [
              __dirname + "/entity/*.ts",
              __dirname + "/entity/map/*.ts",
            ],
            synchronize: true,
            logging: true,
          }),
        ],
        controllers: [],
        providers: [],
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
