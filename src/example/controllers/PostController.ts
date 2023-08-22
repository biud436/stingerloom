import { Controller } from "../../lib/Controller";
import { Get } from "../../lib/Get";
import { Header } from "../../lib/Header";
import { ResponseBuilder } from "../../lib/ResponseBuilder";
import { InternalServerException } from "../../lib/error/InternalServerException";

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
        throw new InternalServerException(
            "포스트를 읽는 중 오류가 발생하였습니다.",
        );

        return new ResponseBuilder("post 입니다.")
            .statusOK()
            .success()
            .response();
    }
}
