import { option as databaseOption } from "../../example/config";
import { DBConnectionOption } from "./DBConnectionOption";

export class DatabaseContext {
    public static getConfig(): DBConnectionOption {
        return databaseOption;
    }
}
