import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import bcrypt from "bcrypt";
import { Exclude } from "class-transformer";
import { GameMap } from "./map/GameMap";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({
        length: 10,
        nullable: false,
    })
    username!: string;

    @Column({
        nullable: false,
    })
    @Exclude()
    password!: string;

    @Column({
        nullable: false,
        default: "user",
    })
    role!: string;

    @Column({
        name: "game_map_id",
        nullable: true,
    })
    gameMapId?: string;

    @ManyToOne(() => GameMap, (gameMap) => gameMap.users, {
        onUpdate: "NO ACTION",
        onDelete: "NO ACTION",
    })
    @JoinColumn({ name: "game_map_id", referencedColumnName: "id" })
    gameMap?: GameMap;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}
