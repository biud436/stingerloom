import { Controller, Get } from "../lib/common/RouterMapper";

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
