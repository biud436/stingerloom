import { Controller } from "@stingerloom/common/decorators/Controller";
import { DFSService } from "./DFSService";
import { Get } from "@stingerloom/common/decorators/Get";

@Controller("/DFS")
export class DFSController {

    constructor(private readonly DFSService: DFSService) {}

    @Get()
    public async getDFS() {
        return await this.DFSService.getDFS();
    }
}