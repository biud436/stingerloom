import { Controller, Get } from "../lib/common/RouterMapper";

@Controller("/")
export class PostController {
    @Get("/post")
    public async getPost() {
        return "post 입니다.";
    }

    @Get("/wow")
    public async getWow() {
        return "wow";
    }
}
