import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../User";

@Entity()
export class GameMap {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @OneToMany(() => User, (user) => user.gameMap)
    users!: User[];
}
