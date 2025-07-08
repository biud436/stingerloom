import { DynamicModuleOption, Module } from "@stingerloom/core";
import { DatabaseClientOptions } from "./core/DatabaseClientOptions";
import { DATABASE_SERVICE_TOKEN, DatabaseService } from "./DatabaseService";

export const DATABASE_OPTION_TOKEN = Symbol.for("DATABASE_OPTION_TOKEN");

@Module({
  controllers: [],
  providers: [],
})
export class DatabaseModule {
  static forRoot(options: DatabaseClientOptions) {
    Reflect.defineMetadata(DATABASE_OPTION_TOKEN, options, DatabaseModule);

    DatabaseService.captured[DATABASE_SERVICE_TOKEN] = true;

    return <DynamicModuleOption>{
      imports: [],
      controllers: [],
      providers: [DatabaseService],
      exports: [DatabaseService],
    };
  }
}
