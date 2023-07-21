import { Controller } from "../lib/common/Controller";
import { Get } from "../lib/common/Get";

@Controller("/post")
export class PostController {
    @Get()
    public async getPost() {
        return "post 입니다.";
    }

    @Get("/wow")
    public async getWow() {
        return "wow";
    }
}
