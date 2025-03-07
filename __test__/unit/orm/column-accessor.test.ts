import {
    Column,
    Entity,
    EntityMetadata,
    ManyToOne,
} from "@stingerloom/core/orm/decorators";
import { EntityScanner } from "@stingerloom/core/orm/scanner";
import { Expose } from "class-transformer";
import Container from "typedi";

describe("Column Accessor", () => {
    let entityScanner: EntityScanner;

    @Entity()
    class User {
        @Column()
        @Expose()
        id!: number;

        @Column()
        @Expose()
        name!: string;

        @Column()
        posts!: Post[];
    }

    @Entity()
    class Post {
        @Column()
        @Expose()
        id!: number;

        @Column()
        @Expose()
        title!: string;

        @ManyToOne(() => User, (entity) => entity.posts, {
            joinColumn: "user_id",
        })
        user!: User;
    }

    beforeEach(() => {
        entityScanner = Container.get(EntityScanner);
        [User, Post].forEach((entity) =>
            console.log(entityScanner.scan(entity)),
        );
    });

    it("User의 메타데이터가 있는지 확인한다.", () => {
        const metadata = entityScanner.scan(User);

        expect(metadata).toBeDefined();
    });

    it("User의 name 컬럼과 String 타입인지 확인한다.", () => {
        const metadata = entityScanner.scan(User) as EntityMetadata<User>;

        const { columns } = metadata;

        const nameColumn = columns.find((c) => c.name === "name");

        expect(nameColumn).toBeDefined();

        expect(nameColumn?.type).toBe(String);
    });

    it("Post의 메타데이터가 있는지 확인한다.", () => {
        const metadata = entityScanner.scan(Post);

        expect(metadata).toBeDefined();
    });

    it("Post의 user 컬럼과 User 타입인지 확인한다. 또한 조인 컬럼이 user_id인지 확인한다.", () => {
        const metadata = entityScanner.scan(Post) as EntityMetadata<Post>;

        const { manyToOnes } = metadata;

        const userColumn = manyToOnes?.find((c) => c.columnName === "user");

        expect(userColumn).toBeDefined();

        expect(userColumn?.getMappingEntity()).toBe(User);
        expect(userColumn?.joinColumn).toBe("user_id");
    });
});
