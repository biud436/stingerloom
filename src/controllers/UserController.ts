import { Repository } from "typeorm";
import { User } from "../entity/User";
import { Controller } from "../lib/Controller";
import { Get } from "../lib/Get";
import { InjectRepository } from "../lib/InjectRepository";

@Controller("/user")
export class UserController {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    @Get()
    public async getUser() {
        const user = await this.userRepository.find();
        return user;
    }
}
