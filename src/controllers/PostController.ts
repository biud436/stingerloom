import { Controller } from "../lib/Controller";
import { Get } from "../lib/Get";

/**
 * @class PostController
 */
@Controller("/post")
export class PostController {
    /**
     * getPost 메서드
     * @returns
     */
    @Get()
    public async getPost() {
        return "post 입니다.";
    }
}
