import {
    Commit,
    InjectRepository,
    Injectable,
    Transactional,
    TransactionalZone,
} from "@stingerloom/common";
import { Repository } from "typeorm/repository/Repository";
import { GameMap } from "./GameMap.entity";
import { User } from "../User.entity";

@Injectable()
@TransactionalZone()
export class GameMapService {
    constructor(
        @InjectRepository(GameMap)
        private readonly gameMapRepository: Repository<GameMap>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    @Transactional()
    async createGameMap() {
        await this.userRepository.clear();

        const qb = this.gameMapRepository.createQueryBuilder("gameMap");
        const maps = await qb
            .select()
            .leftJoinAndSelect("gameMap.users", "user")
            .getMany();

        return maps;
    }

    @Commit()
    async commitOk(txId: string) {
        console.log("Commit OK:", txId);
    }
}
