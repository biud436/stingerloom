import { Controller } from "../lib/Controller";
import { Get } from "../lib/Get";

@Controller("/post")
export class PostController {
    @Get()
    public async getPost() {
        return "post 입니다.";
    }
}
