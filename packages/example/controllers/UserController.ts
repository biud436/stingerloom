/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Repository } from "typeorm";
import { User } from "../entity/User";
import { Controller } from "../../common/decorators/Controller";
import { Get } from "../../common/decorators/Get";
import { Header } from "../../common/decorators/Header";
import { InjectRepository } from "../../common/decorators/InjectRepository";
import { Req } from "../../common/decorators/Req";
import { FastifyRequest } from "fastify";
import { Post } from "../../common/decorators/Post";
import { Body } from "../../common/decorators/Body";
import { CreateUserDto } from "./dto/CreateUserDto";
import { Point } from "../entity/Point";

@Controller("/user")
export class UserController {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly point: Point,
    ) {}

    @Get("/point")
    async getPoint() {
        this.point.move(5, 5);
        return {
            x: this.point.x,
            y: this.point.y,
        };
    }

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
