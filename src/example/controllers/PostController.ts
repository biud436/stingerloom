import { Controller } from "../../lib/common/decorators/Controller";
import { Get } from "../../lib/common/decorators/Get";
import { Header } from "../../lib/common/decorators/Header";
import { ResponseBuilder } from "../../lib/common/ResponseBuilder";
import { InternalServerException } from "../../lib/error/InternalServerException";
import { Point } from "../entity/Point";

/**
 * @class PostController
 */
@Controller("/post")
export class PostController {
    constructor(private readonly point: Point) {}

    /**
     * wow
     * @returns
     */
    @Header("Content-Type", "application/json")
    @Get()
    public async getPost() {
        throw new InternalServerException(
            "포스트를 읽는 중 오류가 발생하였습니다",
        );

        return new ResponseBuilder("post 입니다.")
            .statusOK()
            .success()
            .response();
    }

    @Get("/point")
    async getPoint() {
        this.point.move(4, 4);

        return {
            x: this.point.x,
            y: this.point.y,
        };
    }
}
