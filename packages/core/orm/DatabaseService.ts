import {
    EventService,
    Injectable,
    InstanceScanner,
    OnModuleInit,
} from "@stingerloom/core";
import { DATABASE_OPTION_TOKEN, DatabaseModule } from "./DatabaseModule";
import { DatabaseClientOptions } from "./core/DatabaseClientOptions";
import Database from "../../core/common/Database";
import Container from "typedi";

@Injectable()
export class DatabaseService implements OnModuleInit {
    private database?: Database;

    constructor(private readonly eventService: EventService) {}

    async onModuleInit(): Promise<void> {
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

        this.eventService.on("stop", this.destroy);
    }

    async destroy(): Promise<void> {
        if (this.database) {
            console.log("destroy");
            await this.database.onApplicationShutdown();
        }
    }
}
