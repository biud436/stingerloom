/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Repository } from "typeorm";
import { User } from "../entity/User";
import { Controller } from "../lib/Controller";
import { Get } from "../lib/Get";
import { InjectRepository } from "../lib/InjectRepository";
import { Req } from "../lib/Req";

@Controller("/user")
export class UserController {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    @Get()
    public async getUser(@Req() req: any) {
        const user = await this.userRepository.find();
        return user;
    }
}
