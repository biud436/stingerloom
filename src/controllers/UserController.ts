/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Repository } from "typeorm";
import { User } from "../entity/User";
import { Controller } from "../lib/Controller";
import { Get } from "../lib/Get";
import { Header } from "../lib/Header";
import { InjectRepository } from "../lib/InjectRepository";
import { Req } from "../lib/Req";
import { FastifyRequest } from "fastify";
import { Post } from "../lib/Post";
import { Body } from "../lib/Body";
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
