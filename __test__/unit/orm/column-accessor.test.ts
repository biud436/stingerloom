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

        @Column({
            type: "int",
            name: "user_id",
            length: 11,
            nullable: false,
        })
        @Expose()
        userId!: number;

        @ManyToOne(() => User, (entity) => entity.posts, {
            joinColumn: "user_id",
        })
        user!: User;
    }

    class Book {
        id!: number;
        title!: string;
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

        const { manyToOnes, columns } = metadata;

        const userIdColumn = columns.find((c) => c.name === "user_id");
        const userColumn = manyToOnes?.find((c) => c.columnName === "user");

        expect(userColumn).toBeDefined();

        expect(userColumn?.getMappingEntity()).toBe(User);
        expect(userColumn?.joinColumn).toBe(userIdColumn?.name);
    });

    it("User의 posts 컬럼과 Post 타입인지 확인한다.", () => {
        const metadata = entityScanner.scan(User) as EntityMetadata<User>;

        const { columns } = metadata;

        const postsColumn = columns.find((c) => c.name === "posts");

        expect(postsColumn).toBeDefined();

        expect(postsColumn?.type).toBe(Array);

        expect(postsColumn?.length).toBe(undefined);
    });

    it("메타데이터를 찾지 못했을 때", () => {
        const metadata = entityScanner.scan(Book);

        expect(metadata).toBeNull();
    });
});
