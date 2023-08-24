import { Controller } from "../../common/decorators/Controller";
import { Get } from "../../common/decorators/Get";
import { Header } from "../../common/decorators/Header";
import { ResponseBuilder } from "../../common/ResponseBuilder";
import { InternalServerException } from "../../error/InternalServerException";
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
