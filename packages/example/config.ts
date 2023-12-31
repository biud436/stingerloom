import "reflect-metadata";
import { DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import configService from "@stingerloom/common/ConfigService";

export const option = <DataSourceOptions>{
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
