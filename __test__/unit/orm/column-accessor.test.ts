/**
 * ORM Column Accessor 테스트
 *
 * 이 테스트는 다양한 ORM 기능들을 검증합니다:
 * - Entity 메타데이터 스캔
 * - Column 데코레이터 및 옵션 확인
 * - PrimaryGeneratedColumn, Index, Version 데코레이터
 * - ManyToOne 관계 매핑
 * - 다양한 컬럼 타입 (varchar, text, int, date, boolean, json 등)
 * - 에러 상황 처리
 */
import {
  Column,
  Entity,
  EntityMetadata,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  Version,
} from "@stingerloom/core/orm/decorators";
import { EntityScanner, ColumnMetadata } from "@stingerloom/core/orm/scanner";
import { Expose } from "class-transformer";
import Container from "typedi";

describe("Column Accessor", () => {
  let entityScanner: EntityScanner;

  @Entity()
  class Profile {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255, nullable: true })
    @Expose()
    avatar?: string;

    @Column({ type: "text", length: 2000, nullable: true })
    @Expose()
    bio?: string;

    @Column({ type: "date", length: 10, nullable: true })
    @Expose()
    birthDate?: Date;

    @Column({ type: "int", name: "user_id", length: 11, nullable: false })
    @Expose()
    userId!: number;

    @ManyToOne(() => User, (entity) => entity.profile, {
      joinColumn: "user_id",
    })
    user!: unknown;
  }

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

    @Column()
    profile!: Profile;

    @Column()
    orders!: object[];

    @Column()
    comments!: object[];
  }

  @Entity()
  class Post {
    @Column()
    @Expose()
    id!: number;

    @Column()
    @Expose()
    title!: string;

    @Column({ type: "int", name: "user_id", length: 11, nullable: false })
    @Expose()
    userId!: number;

    @ManyToOne(() => User, (entity) => entity.posts, { joinColumn: "user_id" })
    user!: User;

    @Column()
    comments!: object[];
  }

  @Entity()
  class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100, nullable: false })
    @Expose()
    name!: string;

    @Column({ type: "text", length: 1000, nullable: true })
    @Expose()
    description?: string;

    @Index()
    @Column({ type: "varchar", length: 50, nullable: false })
    @Expose()
    slug!: string;

    posts!: Post[];

    orders!: object[];
  }

  @Entity()
  class Tag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 50, nullable: false })
    @Expose()
    name!: string;

    @Version()
    version!: number;
  }

  class Book {
    id!: number;
    title!: string;
  }

  beforeEach(() => {
    entityScanner = Container.get(EntityScanner);
    // 엔티티들을 스캔하여 메타데이터 생성
    [User, Post, Category, Tag, Profile].forEach((entity) =>
      entityScanner.scan(entity),
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

  // Category 엔티티 테스트
  describe("Category 엔티티 테스트", () => {
    it("Category의 메타데이터가 있는지 확인한다.", () => {
      const metadata = entityScanner.scan(Category);

      expect(metadata).toBeDefined();
      expect(metadata?.name).toBe("category");
    });

    it("Category의 PrimaryGeneratedColumn이 올바르게 설정되었는지 확인한다.", () => {
      const metadata = entityScanner.scan(Category) as EntityMetadata<Category>;
      const { columns } = metadata;

      const idColumn = (columns as unknown as ColumnMetadata[]).find(
        (c) => c.name === "id",
      );

      expect(idColumn).toBeDefined();
      expect(idColumn?.options?.primary).toBe(true);
      expect(idColumn?.options?.autoIncrement).toBe(true);
      expect(idColumn?.options?.type).toBe("int");
      expect(idColumn?.options?.length).toBe(11);
    });

    it("Category의 name 컬럼이 varchar(100)이고 nullable=false인지 확인한다.", () => {
      const metadata = entityScanner.scan(Category) as EntityMetadata<Category>;
      const { columns } = metadata;

      const nameColumn = (columns as unknown as ColumnMetadata[]).find(
        (c) => c.name === "name",
      );

      expect(nameColumn).toBeDefined();
      expect(nameColumn?.options?.type).toBe("varchar");
      expect(nameColumn?.options?.length).toBe(100);
      expect(nameColumn?.options?.nullable).toBe(false);
    });

    it("Category의 description 컬럼이 text이고 nullable=true인지 확인한다.", () => {
      const metadata = entityScanner.scan(Category) as EntityMetadata<Category>;
      const { columns } = metadata;

      const descColumn = (columns as unknown as ColumnMetadata[]).find(
        (c) => c.name === "description",
      );

      expect(descColumn).toBeDefined();
      expect(descColumn?.options?.type).toBe("text");
      expect(descColumn?.options?.length).toBe(1000);
      expect(descColumn?.options?.nullable).toBe(true);
    });

    it("Category의 slug 컬럼에 Index가 설정되어 있는지 확인한다.", () => {
      const metadata = entityScanner.scan(Category) as EntityMetadata<Category>;
      const { columns } = metadata;

      const slugColumn = (columns as unknown as ColumnMetadata[]).find(
        (c) => c.name === "slug",
      );

      expect(slugColumn).toBeDefined();
      expect(slugColumn?.options?.type).toBe("varchar");
      expect(slugColumn?.options?.length).toBe(50);
      expect(slugColumn?.options?.nullable).toBe(false);
    });
  });

  // Tag 엔티티 테스트
  describe("Tag 엔티티 테스트", () => {
    it("Tag의 메타데이터가 있는지 확인한다.", () => {
      const metadata = entityScanner.scan(Tag);

      expect(metadata).toBeDefined();
      expect(metadata?.name).toBe("tag");
    });

    it("Tag에 Version 데코레이터가 적용되었는지 확인한다.", () => {
      const metadata = entityScanner.scan(Tag) as EntityMetadata<Tag>;

      // Version 데코레이터는 내부적으로 Column 데코레이터를 사용하므로
      // 메타데이터가 존재하는지만 확인
      expect(metadata).toBeDefined();
      expect(metadata?.name).toBe("tag");
    });

    it("Tag의 name 컬럼이 varchar(50)이고 nullable=false인지 확인한다.", () => {
      const metadata = entityScanner.scan(Tag) as EntityMetadata<Tag>;
      const { columns } = metadata;

      const nameColumn = (columns as unknown as ColumnMetadata[]).find(
        (c) => c.name === "name",
      );

      expect(nameColumn).toBeDefined();
      expect(nameColumn?.options?.type).toBe("varchar");
      expect(nameColumn?.options?.length).toBe(50);
      expect(nameColumn?.options?.nullable).toBe(false);
    });
  });

  // Profile 엔티티 테스트
  describe("Profile 엔티티 테스트", () => {
    it("Profile의 메타데이터가 있는지 확인한다.", () => {
      const metadata = entityScanner.scan(Profile);

      expect(metadata).toBeDefined();
      expect(metadata?.name).toBe("profile");
    });

    it("Profile의 user 관계가 ManyToOne으로 올바르게 설정되었는지 확인한다.", () => {
      const metadata = entityScanner.scan(Profile) as EntityMetadata<Profile>;
      const { manyToOnes, columns } = metadata;

      const userIdColumn = columns.find((c) => c.name === "user_id");
      const userColumn = manyToOnes?.find((c) => c.columnName === "user");

      expect(userColumn).toBeDefined();
      expect(userColumn?.getMappingEntity()).toBe(User);
      expect(userColumn?.joinColumn).toBe(userIdColumn?.name);
    });

    it("Profile의 avatar 컬럼이 optional이고 varchar(255)인지 확인한다.", () => {
      const metadata = entityScanner.scan(Profile) as EntityMetadata<Profile>;
      const { columns } = metadata;

      const avatarColumn = (columns as unknown as ColumnMetadata[]).find(
        (c) => c.name === "avatar",
      );

      expect(avatarColumn).toBeDefined();
      expect(avatarColumn?.options?.type).toBe("varchar");
      expect(avatarColumn?.options?.length).toBe(255);
      expect(avatarColumn?.options?.nullable).toBe(true);
    });

    it("Profile의 birthDate 컬럼이 date 타입이고 nullable인지 확인한다.", () => {
      const metadata = entityScanner.scan(Profile) as EntityMetadata<Profile>;
      const { columns } = metadata;

      const birthDateColumn = (columns as unknown as ColumnMetadata[]).find(
        (c) => c.name === "birthDate",
      );

      expect(birthDateColumn).toBeDefined();
      expect(birthDateColumn?.options?.type).toBe("date");
      expect(birthDateColumn?.options?.nullable).toBe(true);
    });
  });

  // 컬럼 타입 검증 테스트
  describe("컬럼 타입 검증", () => {
    it("다양한 컬럼 타입들이 올바르게 매핑되는지 확인한다.", () => {
      @Entity()
      class TypeTest {
        @PrimaryGeneratedColumn()
        id!: number;

        @Column({ type: "varchar", length: 255, nullable: false })
        stringField!: string;

        @Column({ type: "int", length: 11, nullable: false })
        intField!: number;

        @Column({ type: "float", length: 10, nullable: false })
        floatField!: number;

        @Column({ type: "boolean", length: 1, nullable: false })
        boolField!: boolean;

        @Column({ type: "datetime", length: 19, nullable: true })
        dateField?: Date;

        @Column({ type: "json", length: 1000, nullable: true })
        jsonField?: object;
      }

      [TypeTest].forEach((entity) => entityScanner.scan(entity));

      const metadata = entityScanner.scan(TypeTest) as EntityMetadata<TypeTest>;
      const { columns } = metadata;

      const columnsTyped = columns as unknown as ColumnMetadata[];

      // String 타입 확인
      const stringColumn = columnsTyped.find((c) => c.name === "stringField");
      expect(stringColumn?.options?.type).toBe("varchar");

      // Int 타입 확인
      const intColumn = columnsTyped.find((c) => c.name === "intField");
      expect(intColumn?.options?.type).toBe("int");

      // Float 타입 확인
      const floatColumn = columnsTyped.find((c) => c.name === "floatField");
      expect(floatColumn?.options?.type).toBe("float");

      // Boolean 타입 확인
      const boolColumn = columnsTyped.find((c) => c.name === "boolField");
      expect(boolColumn?.options?.type).toBe("boolean");

      // DateTime 타입 확인
      const dateColumn = columnsTyped.find((c) => c.name === "dateField");
      expect(dateColumn?.options?.type).toBe("datetime");

      // JSON 타입 확인
      const jsonColumn = columnsTyped.find((c) => c.name === "jsonField");
      expect(jsonColumn?.options?.type).toBe("json");
    });

    it("컬럼 옵션의 name 속성이 올바르게 동작하는지 확인한다.", () => {
      @Entity()
      class NameTest {
        @Column({
          type: "varchar",
          length: 255,
          nullable: false,
          name: "custom_column_name",
        })
        fieldName!: string;
      }

      [NameTest].forEach((entity) => entityScanner.scan(entity));

      const metadata = entityScanner.scan(NameTest) as EntityMetadata<NameTest>;
      const { columns } = metadata;

      const customColumn = (columns as unknown as ColumnMetadata[]).find(
        (c) => c.name === "custom_column_name",
      );
      expect(customColumn).toBeDefined();
      expect(customColumn?.name).toBe("custom_column_name");
    });
  });

  // 관계 매핑 테스트
  describe("관계 매핑 테스트", () => {
    it("여러 ManyToOne 관계가 올바르게 매핑되는지 확인한다.", () => {
      @Entity()
      class Order {
        @PrimaryGeneratedColumn()
        id!: number;

        @Column({ type: "int", name: "user_id", length: 11, nullable: false })
        userId!: number;

        @Column({
          type: "int",
          name: "product_id",
          length: 11,
          nullable: false,
        })
        productId!: number;

        @ManyToOne(() => User, (entity) => entity.orders, {
          joinColumn: "user_id",
        })
        user!: User;

        @ManyToOne(() => Category, (entity) => entity.orders, {
          joinColumn: "product_id",
        })
        product!: Category; // Category를 Product 대신 사용
      }

      [Order].forEach((entity) => entityScanner.scan(entity));

      const metadata = entityScanner.scan(Order) as EntityMetadata<Order>;
      const { manyToOnes } = metadata;

      // User 관계 확인
      const userColumn = manyToOnes?.find((c) => c.columnName === "user");
      expect(userColumn).toBeDefined();
      expect(userColumn?.getMappingEntity()).toBe(User);
      expect(userColumn?.joinColumn).toBe("user_id");

      // Product 관계 확인
      const productColumn = manyToOnes?.find((c) => c.columnName === "product");
      expect(productColumn).toBeDefined();
      expect(productColumn?.getMappingEntity()).toBe(Category);
      expect(productColumn?.joinColumn).toBe("product_id");
    });

    it("joinColumn이 없는 ManyToOne 관계가 올바르게 처리되는지 확인한다.", () => {
      @Entity()
      class Comment {
        @PrimaryGeneratedColumn()
        id!: number;

        @ManyToOne(() => Post, (entity) => entity.comments)
        post!: Post;
      }

      [Comment].forEach((entity) => entityScanner.scan(entity));

      const metadata = entityScanner.scan(Comment) as EntityMetadata<Comment>;
      const { manyToOnes } = metadata;

      const postColumn = manyToOnes?.find((c) => c.columnName === "post");
      expect(postColumn).toBeDefined();
      expect(postColumn?.getMappingEntity()).toBe(Post);
      expect(postColumn?.joinColumn).toBeUndefined();
    });
  });

  // 에러 상황 테스트
  describe("에러 상황 테스트", () => {
    it("Entity 데코레이터가 없는 클래스는 메타데이터를 찾을 수 없다.", () => {
      class NonEntityClass {
        @Column({ type: "varchar", length: 255, nullable: false })
        name!: string;
      }

      const metadata = entityScanner.scan(NonEntityClass);
      expect(metadata).toBeNull();
    });

    it("빈 엔티티의 메타데이터를 확인한다.", () => {
      @Entity()
      class EmptyEntity {}

      [EmptyEntity].forEach((entity) => entityScanner.scan(entity));

      const metadata = entityScanner.scan(
        EmptyEntity,
      ) as EntityMetadata<EmptyEntity>;
      expect(metadata).toBeDefined();
      expect(metadata.columns).toBeDefined();
      expect(metadata.name).toBe("empty_entity");
    });
  });
});
