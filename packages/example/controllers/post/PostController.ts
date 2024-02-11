import { Controller } from "@stingerloom/common/decorators/Controller";
import { Get } from "@stingerloom/common/decorators/Get";
import { Header } from "@stingerloom/common/decorators/Header";
import { InternalServerException } from "@stingerloom/error/InternalServerException";
import { Point } from "../../entity/Point";

/**
 * @class PostController
 */
@Controller("/post")
export class PostController {
    constructor(private readonly point: Point) {}

    /**
     * @returns
     */
    @Header("Content-Type", "application/json")
    @Get()
    public async getPost() {
        throw new InternalServerException(
            "포스트를 읽는 중 오류가 발생하였습니다",
        );
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
