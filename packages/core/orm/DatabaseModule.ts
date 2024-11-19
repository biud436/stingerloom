import { DynamicModuleOption, Module } from "@stingerloom/core";
import { DatabaseClientOptions } from "./core/DatabaseClientOptions";
import { DatabaseService } from "./DatabaseService";

export const DATABASE_OPTION_TOKEN = Symbol.for("DATABASE_OPTION_TOKEN");

@Module({
    controllers: [],
    providers: [],
})
export class DatabaseModule {
    static forRoot(options: DatabaseClientOptions) {
        Reflect.defineMetadata(DATABASE_OPTION_TOKEN, options, DatabaseModule);

        return <DynamicModuleOption>{
            controllers: [],
            providers: [DatabaseService],
        };
    }
}
