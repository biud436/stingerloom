import {
    BaseEntity,
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import bcrypt from "bcrypt";
import { Exclude } from "class-transformer";

@Entity()
export class User extends BaseEntity {
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

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }
}
