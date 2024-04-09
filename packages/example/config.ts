import "reflect-metadata";
import { DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import configService from "@stingerloom/common/ConfigService";
import { User } from "./entity/User.entity";
import { GameMap } from "./entity/map/GameMap.entity";

export const option = <DataSourceOptions>{
    type: "mariadb",
    host: configService.get<string>("DB_HOST"),
    port: configService.get<number>("DB_PORT"),
    database: configService.get<string>("DB_NAME"),
    password: configService.get<string>("DB_PASSWORD"),
    username: configService.get<string>("DB_USER"),
    entities: [User, GameMap],
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: false,
    logging: true,
};
