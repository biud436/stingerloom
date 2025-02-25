/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import { Expose } from "class-transformer";
import { Column, Entity, ManyToOne } from "@stingerloom/core/orm/decorators";
import { QueryResult } from "@stingerloom/core/orm/types";
import { ResultTransformerFactory } from "@stingerloom/core/orm/core";

describe("ResultTransformer", () => {
    @Entity()
    class PostComment {
        @Column()
        @Expose()
        id!: number;

        @Column()
        @Expose()
        content!: string;

        @Column()
        @Expose()
        created_at!: Date;

        @Expose()
        posts?: Post[];
    }

    @Entity()
    class Post {
        @Column()
        @Expose()
        id!: number;

        @Column()
        @Expose()
        title!: string;

        @Column()
        @Expose()
        content!: string;

        @Expose()
        @Column()
        @ManyToOne(() => PostComment, (entity) => entity.posts)
        comment?: PostComment;

        @Expose()
        users?: User[];
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
        @Expose()
        email!: string;

        @Column()
        @Expose()
        @ManyToOne(() => Post, (entity) => entity.users)
        post?: Post;
    }

    const resultTransformer = ResultTransformerFactory.create();

    describe("toEntity", () => {
        it("User로 변환할 수 있어야 합니다", () => {
            const mockResult: QueryResult = {
                results: [
                    {
                        id: 1,
                        name: "홍길동",
                        email: "hong@example.com",
                    },
                ],
            };

            const user = resultTransformer.toEntity(User, mockResult);

            expect(user).toBeDefined();
            expect(user).toBeInstanceOf(User);
            expect(user?.id).toBe(1);
            expect(user?.name).toBe("홍길동");
            expect(user?.email).toBe("hong@example.com");
        });

        it("결과가 없을 경우 undefined를 반환해야 합니다", () => {
            const mockResult: QueryResult = {
                results: [],
            };

            const user = resultTransformer.toEntity(User, mockResult);

            expect(user).toBeUndefined();
        });
    });

    describe("toEntities", () => {
        it("User 배열로 변환할 수 있어야 합니다.", () => {
            const mockResult: QueryResult = {
                results: [
                    { id: 1, name: "홍길동", email: "hong@example.com" },
                    { id: 2, name: "김철수", email: "kim@example.com" },
                ],
            };

            const users = resultTransformer.toEntities(User, mockResult);

            expect(users).toHaveLength(2);
            expect(users[0]).toBeInstanceOf(User);
            expect(users[1]).toBeInstanceOf(User);
            expect(users[0].name).toBe("홍길동");
            expect(users[1].name).toBe("김철수");
        });

        it("결과가 없을 경우 빈 배열을 반환해야 합니다", () => {
            const mockResult: QueryResult = {
                results: [],
            };

            const users = resultTransformer.toEntities(User, mockResult);

            expect(users).toEqual([]);
        });
    });

    describe("transform", () => {
        it("결과가 1개일 경우 User를 반환해야 합니다", () => {
            const mockResult: QueryResult = {
                results: [
                    {
                        id: 1,
                        name: "홍길동",
                        email: "hong@example.com",
                    },
                ],
            };

            const result = resultTransformer.transform(User, mockResult);

            expect(result).toBeInstanceOf(User);
            expect((result as User).name).toBe("홍길동");
        });

        it("다중 결과일 경우 User 배열을 반환해야 합니다", () => {
            const mockResult: QueryResult = {
                results: [
                    { id: 1, name: "홍길동", email: "hong@example.com" },
                    { id: 2, name: "김철수", email: "kim@example.com" },
                ],
            };

            const result = resultTransformer.transform(User, mockResult);

            expect(Array.isArray(result)).toBeTruthy();
            expect((result as User[]).length).toBe(2);
        });
    });

    describe("transformNested", () => {
        it("중첩된 관계를 변환할 수 있어야 합니다", () => {
            const mockResult: QueryResult = {
                results: [
                    {
                        id: 1,
                        name: "홍길동",
                        email: "hong@example.com",
                        post_id: 1,
                        post_title: "첫 번째 글",
                        post_content: "내용입니다",
                        post_comment_id: 1,
                        post_comment_content: "댓글입니다",
                        post_comment_created_at: "2024-03-16T00:00:00Z",
                    },
                ],
            };

            const result = resultTransformer.transformNested(User, mockResult, {
                posts: Post,
            });

            expect(result).toBeInstanceOf(User);
            const user = result as User;

            console.log(user);

            // post 객체 검증
            const post = user?.post;

            expect(post).toBeInstanceOf(Post);
            expect(post?.id).toBe(1);
            expect(post?.title).toBe("첫 번째 글");
            expect(post?.content).toBe("내용입니다");

            // comments 배열 검증 (중첩의 중첩인 경우에는 comments가 배열로 변환되어야 하는데 실패함)
            expect(post?.comment).toBeDefined();
            expect(Array.isArray(post?.comment)).toBeFalsy();
        });

        it("중첩 관계가 없는 경우에도 정상 동작해야 합니다", () => {
            const mockResult: QueryResult = {
                results: [
                    {
                        id: 1,
                        name: "홍길동",
                        email: "hong@example.com",
                    },
                ],
            };

            const result = resultTransformer.transformNested(
                User,
                mockResult,
                {},
            );

            expect(result).toBeInstanceOf(User);
            const user = result as User;
            expect(user.id).toBe(1);
            expect(user.name).toBe("홍길동");
            expect(user.email).toBe("hong@example.com");
        });

        it("다중 레벨의 중첩 관계를 변환할 수 있어야 합니다", () => {
            const mockResult: QueryResult = {
                results: [
                    {
                        id: 1,
                        name: "홍길동",
                        email: "hong@example.com",
                        post_id: 1,
                        post_title: "첫 번째 글",
                        post_content: "내용입니다",
                        comment_id: 1,
                        comment_content: "댓글입니다",
                        comment_created_at: "2024-03-16T00:00:00Z",
                    },
                ],
            };

            const result = resultTransformer.transformNested(User, mockResult, {
                post: Post,
                comment: PostComment,
            });

            expect(result).toBeInstanceOf(User);
            const user = result as User;
            expect(user.post).toBeDefined();
            expect(user.post).toBeInstanceOf(Post);
            // if (user.post?.comment) {
            expect(user.post?.comment).toBeInstanceOf(PostComment);
            // }
        });

        it("단일 행에 다수의 중첩된 관계 데이터 포함", () => {
            const mockResult: QueryResult = {
                results: [
                    {
                        id: 1,
                        name: "Alice",
                        email: "alice@stingerloom.com",
                        // 'address' 관계 데이터 (키 접두사 "address_" 사용)
                        address_street: "123 Main St",
                        address_city: "Anytown",
                        // 'order' 관계 데이터 (키 접두사 "order_" 사용)
                        order_id: 1001,
                        order_total: 150.75,
                    },
                ],
            };

            @Entity()
            class Address {
                @Column()
                street!: string;

                @Column()
                city!: string;

                users!: GoodUser[];
            }

            @Entity()
            class Order {
                @Column()
                id!: number;

                @Column()
                total!: number;

                users!: GoodUser[];
            }

            @Entity()
            class GoodUser {
                @Column()
                @Expose()
                id!: number;

                @Column()
                @Expose()
                name!: string;

                @Column()
                @Expose()
                email!: string;

                @Expose()
                @ManyToOne(() => Address, (entity) => entity.users, {})
                address!: Address;

                // @Expose()
                @ManyToOne(() => Order, (entity) => entity.users, {})
                order!: Order;
            }

            const result = resultTransformer.transformNested<GoodUser>(
                GoodUser,
                mockResult,
                {
                    address: Address,
                    order: Order,
                },
            ) as GoodUser;

            expect(result).toBeInstanceOf(GoodUser);
            expect(result?.address).toBeInstanceOf(Address);
        });
    });
});
