import { ServerBootstrapApplication } from "@stingerloom/bootstrap";
import { PostController } from "./controllers/post/PostController";
import { UserController } from "./controllers/user/UserController";
import { InternalErrorFilter } from "./exceptions/InternalErrorFilter";
import { option as databaseOption } from "./config";
import { UserService } from "./controllers/user/UserService";

export class StingerLoomBootstrapApplication extends ServerBootstrapApplication {
    override beforeStart(): void {
        this.moduleOptions = {
            controllers: [PostController, UserController],
            providers: [InternalErrorFilter, UserService],
            configuration: databaseOption,
        };
    }
}

Promise.resolve(new StingerLoomBootstrapApplication().start()).catch((err) => {
    console.error(err);
});
