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

export const DATABASE_SERVICE_TOKEN = Symbol.for("DATABASE_SERVICE_TOKEN");

@Injectable()
export class DatabaseService implements OnModuleInit {
  private database?: Database;
  private entityManager!: EntityManager;
  private readonly logger = new Logger(DatabaseService.name);

  public static captured = {} as Record<typeof DATABASE_SERVICE_TOKEN, boolean>;

  constructor(private readonly eventService: EventService) {
    this.logger.info("DatabaseService initialized");
  }

  async onModuleInit(): Promise<void> {
    this.logger.info("DatabaseService onModuleInit");

    if (!DatabaseService.captured[DATABASE_SERVICE_TOKEN]) {
      return;
    }

    await this.initEntityManager();
    await this.registerEntities();

    this.eventService.on("stop", () => this.destroy());
  }

  async destroy(): Promise<void> {
    if (this.database) {
      this.logger.info("Destroying database connection");
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
    const options = Reflect.getMetadata(
      DATABASE_OPTION_TOKEN,
      DatabaseModule,
    ) as DatabaseClientOptions;

    if (!options) {
      throw new Error("Database configuration is required.");
    }

    await this.entityManager.register(options);
  }

  private async propagateShutdown() {
    await this.entityManager.propagateShutdown();
  }
}
