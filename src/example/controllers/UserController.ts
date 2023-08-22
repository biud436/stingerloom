/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Repository } from "typeorm";
import { User } from "../entity/User";
import { Controller } from "../../lib/common/decorators/Controller";
import { Get } from "../../lib/common/decorators/Get";
import { Header } from "../../lib/common/decorators/Header";
import { InjectRepository } from "../../lib/common/decorators/InjectRepository";
import { Req } from "../../lib/common/decorators/Req";
import { FastifyRequest } from "fastify";
import { Post } from "../../lib/common/decorators/Post";
import { Body } from "../../lib/common/decorators/Body";
import { CreateUserDto } from "./dto/CreateUserDto";

@Controller("/user")
export class UserController {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    @Header("Content-Type", "application/json")
    @Get()
    public async getUser(@Req() req: FastifyRequest) {
        const user = await this.userRepository.find();
        return {
            user,
            ip: req.ip,
        };
    }

    @Post()
    public async create(@Body() createUserDto: CreateUserDto) {
        const newUser = await this.userRepository.create(createUserDto);
        return await this.userRepository.save(newUser);
    }
}
