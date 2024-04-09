/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClazzType, Logger, ReflectManager } from "@stingerloom/common";
import { EntityMetadata, EntityScanner } from "../scanner";
import Container from "typedi";
import { DatabaseClient } from "../DatabaseClient";
import configService from "@stingerloom/common/ConfigService";
import { MySqlDriver } from "../dialects/mysql/MySqlDriver";

export class EntityManager {
    private _entities: ClazzType<any>[] = [];
    private readonly logger = new Logger(EntityManager.name);
    private driver?: MySqlDriver;

    public async register() {
        await this.connect();
        await this.registerEntities();
    }

    public async connect() {
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

        this.driver = new MySqlDriver(connector);
    }

    public async propagateShutdown() {
        // TODO: 나중에 추가
    }

    private async registerEntities() {
        const entityScanner = Container.get(EntityScanner);
        const entities = entityScanner.makeEntities();

        let entity: IteratorResult<EntityMetadata>;

        while ((entity = entities.next())) {
            if (entity.done) break;

            const metadata = entity.value as EntityMetadata;

            const TargetEntity = metadata.target as ClazzType<any>;
            if (!ReflectManager.isEntity(TargetEntity)) {
                throw new Error(
                    `${TargetEntity.name}은 Entity가 아닌 듯 합니다..`,
                );
            }

            const hasCollection = await this.driver?.hasCollection(
                TargetEntity.name,
            );

            if (!hasCollection || hasCollection.length === 0) {
                await this.driver?.createCollection(
                    TargetEntity.name,
                    metadata.columns,
                );
            }
        }
    }
}
