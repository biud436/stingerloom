import { Controller } from "../../lib/common/decorators/Controller";
import { Get } from "../../lib/common/decorators/Get";
import { Header } from "../../lib/common/decorators/Header";
import { ResponseBuilder } from "../../lib/common/ResponseBuilder";
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
