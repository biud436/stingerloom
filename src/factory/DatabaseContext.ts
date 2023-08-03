import { option as databaseOption } from "../config";
import { DBConnectionOption } from "./DBConnectionOption";

export class DatabaseContext {
    public static getConfig(): DBConnectionOption {
        return databaseOption;
    }
}
