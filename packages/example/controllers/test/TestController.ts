import { Controller } from "@stingerloom/common/decorators/Controller";
import { TestService } from "./TestService";
import { Get } from "@stingerloom/common/decorators/Get";

@Controller("/test")
export class TestController {

    constructor(private readonly testService: TestService) {}

    @Get()
    public async getTest() {
        return await this.testService.getTest();
    }
}