import { Get } from "../lib/common/RouterMapper";

export class PostController {
    @Get("/post")
    public async getPost() {
        return "post 입니다.";
    }

    @Get("/wow")
    public async getWow() {
        return "wow 입니다.";
    }
}
