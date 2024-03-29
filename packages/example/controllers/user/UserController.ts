/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { QueryRunner, Repository } from "typeorm";
import { User } from "../../entity/User.entity";
import { Controller } from "@stingerloom/common/decorators/Controller";
import { Get } from "@stingerloom/common/decorators/Get";
import { Header } from "@stingerloom/common/decorators/Header";
import { InjectRepository } from "@stingerloom/common/decorators/InjectRepository";
import { Req } from "@stingerloom/common/decorators/Req";
import { FastifyRequest } from "fastify";
import { Post } from "@stingerloom/common/decorators/Post";
import { Body } from "@stingerloom/common/decorators/Body";
import { CreateUserDto } from "./dto/CreateUserDto";
import { Point } from "../../entity/Point";
import { UserService } from "./UserService";
import { TransactionalZone } from "@stingerloom/common/decorators/TransactionalZone";
import { InjectQueryRunner, Ip, Transactional } from "@stingerloom/common";
import { GameMapService } from "@stingerloom/example/entity/map/GameMapService";

@Controller("/user")
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly gameMapService: GameMapService,
    ) {}

    @Post()
    public async create(@Body() createUserDto: CreateUserDto) {
        return await this.userService.create(createUserDto);
    }

    @Header("Content-Type", "application/json")
    @Get()
    public async getUser(@Ip() ip: string) {
        return await this.userService.getUser(ip);
    }

    @Get("/test2")
    async test() {
        return await this.gameMapService.createGameMap();
    }
}
