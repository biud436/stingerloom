import { PostController } from "./controllers/PostController";
import { UserController } from "./controllers/UserController";
import { InternalErrorFilter } from "./exceptions/InternalErrorFilter";

export class InstanceLoader {
    public static load() {
        return {
            controllers: [PostController, UserController],
            providers: [InternalErrorFilter],
        };
    }
}
