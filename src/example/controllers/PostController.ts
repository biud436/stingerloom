import { Controller } from "../../lib/Controller";
import { Get } from "../../lib/Get";
import { Header } from "../../lib/Header";
import { ResponseBuilder } from "../../lib/ResponseBuilder";

/**
 * @class PostController
 */
@Controller("/post")
export class PostController {
    /**
     * wow
     * @returns
     */
    @Header("Content-Type", "application/json")
    @Get()
    public async getPost() {
        return new ResponseBuilder("post 입니다.")
            .statusOK()
            .success()
            .response();
    }
}
