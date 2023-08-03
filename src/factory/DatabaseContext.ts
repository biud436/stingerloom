import { option as databaseOption } from "../config";
import { DBConnectionOption } from "./DatabaseFactory";

export class DatabaseContext {
    public static getConfig(): DBConnectionOption {
        return databaseOption;
    }
}
