import { ServerBootstrapApplication } from "@stingerloom/bootstrap";
import { PostController } from "./controllers/PostController";
import { UserController } from "./controllers/UserController";
import { InternalErrorFilter } from "./exceptions/InternalErrorFilter";
import { option as databaseOption } from "./config";

export class StingerLoomBootstrapApplication extends ServerBootstrapApplication {
    beforeStart(): void {
        this.moduleOptions = {
            controllers: [PostController, UserController],
            providers: [InternalErrorFilter],
            configuration: databaseOption,
        };
    }
}

Promise.resolve(new StingerLoomBootstrapApplication().start()).catch((err) => {
    console.error(err);
});
