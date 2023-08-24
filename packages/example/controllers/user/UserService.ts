import { InjectRepository, Injectable } from "@stingerloom/common";
import { User } from "@stingerloom/example/entity/User";
import { Repository } from "typeorm/repository/Repository";
import { CreateUserDto } from "./dto/CreateUserDto";
import { DiscoveryService } from "@stingerloom/services";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly discoveryService: DiscoveryService,
    ) {}

    async create(createUserDto: CreateUserDto) {
        const newUser = await this.userRepository.create(createUserDto);
        return await this.userRepository.save(newUser);
    }

    async getUser(ip: string) {
        const user = await this.userRepository.find();
        return {
            user,
            ip,
        };
    }
}
