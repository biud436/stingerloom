import { option as databaseOption } from "../config";

export class DatabaseContext {
    public static getConfig() {
        return databaseOption;
    }
}
