import { Expose, Type } from "class-transformer";
import { Column, Entity } from "@stingerloom/core/orm/decorators";
import { ResultTransformer } from "@stingerloom/core/orm/core/ResultTransformer";
import { QueryResult } from "@stingerloom/core/orm/core";

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
        @Type(() => PostComment)
        @Column()
        comments?: PostComment[];
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
        @Type(() => Post)
        posts?: Post[];
    }

    describe("toEntity", () => {
        it("단일 사용자를 변환할 수 있어야 합니다", () => {
            const mockResult: QueryResult = {
                results: [
                    {
                        id: 1,
                        name: "홍길동",
                        email: "hong@example.com",
                    },
                ],
            };

            const user = ResultTransformer.toEntity(User, mockResult);

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

            const user = ResultTransformer.toEntity(User, mockResult);

            expect(user).toBeUndefined();
        });
    });

    describe("toEntities", () => {
        it("여러 사용자를 변환할 수 있어야 합니다", () => {
            const mockResult: QueryResult = {
                results: [
                    { id: 1, name: "홍길동", email: "hong@example.com" },
                    { id: 2, name: "김철수", email: "kim@example.com" },
                ],
            };

            const users = ResultTransformer.toEntities(User, mockResult);

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

            const users = ResultTransformer.toEntities(User, mockResult);

            expect(users).toEqual([]);
        });
    });

    describe("transform", () => {
        it("단일 결과일 경우 엔티티를 반환해야 합니다", () => {
            const mockResult: QueryResult = {
                results: [
                    {
                        id: 1,
                        name: "홍길동",
                        email: "hong@example.com",
                    },
                ],
            };

            const result = ResultTransformer.transform(User, mockResult);

            expect(result).toBeInstanceOf(User);
            expect((result as User).name).toBe("홍길동");
        });

        it("다중 결과일 경우 엔티티 배열을 반환해야 합니다", () => {
            const mockResult: QueryResult = {
                results: [
                    { id: 1, name: "홍길동", email: "hong@example.com" },
                    { id: 2, name: "김철수", email: "kim@example.com" },
                ],
            };

            const result = ResultTransformer.transform(User, mockResult);

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
                        posts_id: 1,
                        posts_title: "첫 번째 글",
                        posts_content: "내용입니다",
                        posts_comments_id: 1,
                        posts_comments_content: "댓글입니다",
                        posts_comments_created_at: "2024-03-16T00:00:00Z",
                    },
                ],
            };

            const result = ResultTransformer.transformNested(User, mockResult, {
                posts: Post,
            });

            expect(result).toBeInstanceOf(User);
            const user = result as User;

            // posts 배열 검증
            expect(user.posts).toBeDefined();
            expect(Array.isArray(user.posts)).toBeTruthy();
            expect(user?.posts?.length).toBeGreaterThan(0);

            // post 객체 검증
            const post = user?.posts?.[0];
            expect(post).toBeInstanceOf(Post);
            expect(post?.id).toBe(1);
            expect(post?.title).toBe("첫 번째 글");
            expect(post?.content).toBe("내용입니다");
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

            const result = ResultTransformer.transformNested(
                User,
                mockResult,
                {},
            );

            expect(result).toBeInstanceOf(User);
            const user = result as User;
            expect(user.id).toBe(1);
            expect(user.name).toBe("홍길동");
            expect(user.email).toBe("hong@example.com");
            expect(user.posts).toBeUndefined();
        });

        it("다중 레벨의 중첩 관계를 변환할 수 있어야 합니다", () => {
            const mockResult: QueryResult = {
                results: [
                    {
                        id: 1,
                        name: "홍길동",
                        email: "hong@example.com",
                        posts_id: 1,
                        posts_title: "첫 번째 글",
                        posts_content: "내용입니다",
                        comments_id: 1,
                        comments_content: "댓글입니다",
                        comments_created_at: "2024-03-16T00:00:00Z",
                    },
                ],
            };

            const result = ResultTransformer.transformNested(User, mockResult, {
                posts: Post,
                comments: PostComment,
            });

            expect(result).toBeInstanceOf(User);
            const user = result as User;
            expect(user.posts).toBeDefined();
            expect(user.posts?.[0]).toBeInstanceOf(Post);
            if (user.posts?.[0].comments) {
                expect(user.posts[0].comments[0]).toBeInstanceOf(PostComment);
            }
        });
    });
});
