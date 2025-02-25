import "reflect-metadata";
import {
    EventService,
    Injectable,
    InstanceScanner,
    OnModuleInit,
} from "@stingerloom/core";
import { DATABASE_OPTION_TOKEN, DatabaseModule } from "./DatabaseModule";
import { DatabaseClientOptions } from "./core/DatabaseClientOptions";
import Database from "../common/database/DatabaseV1";
import Container from "typedi";
import { EntityManager } from "./core";

@Injectable()
export class DatabaseService implements OnModuleInit {
    private database?: Database;
    private entityManager!: EntityManager;

    constructor(private readonly eventService: EventService) {}

    async onModuleInit(): Promise<void> {
        await this.initEntityManager();
        await this.registerEntities();

        this.eventService.on("stop", () => this.destroy());
    }

    async destroy(): Promise<void> {
        if (this.database) {
            console.log("destroy");
            await this.database.onApplicationShutdown();
        }

        await this.propagateShutdown();
    }

    /**
     * @deprecated
     */
    private async initializeTypeOrm() {
        const options = Reflect.getMetadata(
            DATABASE_OPTION_TOKEN,
            DatabaseModule,
        ) as DatabaseClientOptions;

        if (!options) {
            // TODO: module 상태에 onStart가 필요할 듯.
            return;
        }

        const database = new Database(options);
        const instanceScanner = Container.get(InstanceScanner);
        instanceScanner.set(Database, database);

        await database.start();

        this.database = database;
    }

    private async initEntityManager() {
        this.entityManager = new EntityManager();

        const instanceScanner = Container.get(InstanceScanner);
        instanceScanner.set(EntityManager, this.entityManager);
    }

    private async registerEntities() {
        console.log("registerEntities");
        await this.entityManager.register();
    }

    private async propagateShutdown() {
        await this.entityManager.propagateShutdown();
    }
}
