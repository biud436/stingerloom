/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import { Expose } from "class-transformer";
import { deserializeEntity } from "@stingerloom/core/orm/core/DeserializeEntity";

describe("DeserializeEntity", () => {
  class User {
    @Expose()
    id!: number;

    @Expose()
    name!: string;

    @Expose()
    email!: string;

    age?: number;
  }

  describe("단일 객체 역직렬화", () => {
    it("plain 객체를 클래스 인스턴스로 변환해야 함", () => {
      const plain = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
      };

      const result = deserializeEntity(User, plain);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(1);
      expect(result.name).toBe("John Doe");
      expect(result.email).toBe("john@example.com");
    });

    it("추가 속성도 포함해야 함 (기본값)", () => {
      const plain = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        extraField: "extra",
      };

      const result = deserializeEntity(User, plain);

      expect(result).toBeInstanceOf(User);
      expect((result as any).extraField).toBe("extra");
    });

    it("빈 객체를 처리해야 함", () => {
      const plain = {};

      const result = deserializeEntity(User, plain);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBeUndefined();
      expect(result.name).toBeUndefined();
    });
  });

  describe("배열 역직렬화", () => {
    it("plain 객체 배열을 클래스 인스턴스 배열로 변환해야 함", () => {
      const plains = [
        { id: 1, name: "John", email: "john@example.com" },
        { id: 2, name: "Jane", email: "jane@example.com" },
      ];

      const result = deserializeEntity(User, plains);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect((result as any)[0]).toBeInstanceOf(User);
      expect((result as any)[1]).toBeInstanceOf(User);
      expect((result as any)[0].name).toBe("John");
      expect((result as any)[1].name).toBe("Jane");
    });

    it("빈 배열을 처리해야 함", () => {
      const plains: any[] = [];

      const result = deserializeEntity(User, plains);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });
  });

  describe("옵션 - excludeExtraneousValues", () => {
    it("excludeExtraneousValues가 true면 추가 속성을 제외해야 함", () => {
      const plain = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        extraField: "should be excluded",
      };

      const result = deserializeEntity(User, plain, {
        excludeExtraneousValues: true,
      });

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(1);
      expect(result.name).toBe("John Doe");
      expect((result as any).extraField).toBeUndefined();
    });

    it("excludeExtraneousValues가 false면 추가 속성을 포함해야 함 (기본 동작)", () => {
      const plain = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        extraField: "should be included",
      };

      const result = deserializeEntity(User, plain, {
        excludeExtraneousValues: false,
      });

      expect(result).toBeInstanceOf(User);
      expect((result as any).extraField).toBe("should be included");
    });
  });

  describe("옵션 - groups", () => {
    class Post {
      @Expose()
      id!: number;

      @Expose({ groups: ["detail"] })
      content!: string;

      @Expose({ groups: ["list", "detail"] })
      title!: string;
    }

    it("groups 옵션으로 특정 그룹만 노출해야 함", () => {
      const plain = {
        id: 1,
        title: "Test Post",
        content: "This is content",
      };

      const result = deserializeEntity(Post, plain, {
        groups: ["list"],
        excludeExtraneousValues: true,
      });

      expect(result).toBeInstanceOf(Post);
      expect(result.title).toBe("Test Post");
      // list 그룹에는 content가 없으므로 제외될 수 있음
    });
  });

  describe("중첩 객체", () => {
    class Address {
      @Expose()
      street!: string;

      @Expose()
      city!: string;
    }

    class UserWithAddress {
      @Expose()
      id!: number;

      @Expose()
      name!: string;

      address?: Address;
    }

    it("중첩 객체를 처리해야 함", () => {
      const plain = {
        id: 1,
        name: "John Doe",
        address: {
          street: "123 Main St",
          city: "New York",
        },
      };

      const result = deserializeEntity(UserWithAddress, plain);

      expect(result).toBeInstanceOf(UserWithAddress);
      expect(result.id).toBe(1);
      expect(result.name).toBe("John Doe");
      expect(result.address).toBeDefined();
      expect(result.address?.street).toBe("123 Main St");
      expect(result.address?.city).toBe("New York");
    });
  });

  describe("특수 값 처리", () => {
    it("null 값을 올바르게 처리해야 함", () => {
      const plain = {
        id: 1,
        name: null,
        email: "john@example.com",
      };

      const result = deserializeEntity(User, plain);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(1);
      expect(result.name).toBeNull();
      expect(result.email).toBe("john@example.com");
    });

    it("undefined 값을 올바르게 처리해야 함", () => {
      const plain = {
        id: 1,
        name: undefined,
        email: "john@example.com",
      };

      const result = deserializeEntity(User, plain);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(1);
      expect(result.name).toBeUndefined();
      expect(result.email).toBe("john@example.com");
    });

    it("빈 문자열을 올바르게 처리해야 함", () => {
      const plain = {
        id: 1,
        name: "",
        email: "john@example.com",
      };

      const result = deserializeEntity(User, plain);

      expect(result).toBeInstanceOf(User);
      expect(result.name).toBe("");
    });

    it("0과 false를 올바르게 처리해야 함", () => {
      class Settings {
        @Expose()
        count!: number;

        @Expose()
        enabled!: boolean;
      }

      const plain = {
        count: 0,
        enabled: false,
      };

      const result = deserializeEntity(Settings, plain);

      expect(result).toBeInstanceOf(Settings);
      expect(result.count).toBe(0);
      expect(result.enabled).toBe(false);
    });
  });

  describe("타입 변환", () => {
    it("문자열을 숫자로 자동 변환하지 않아야 함 (기본 동작)", () => {
      const plain = {
        id: "123",
        name: "John Doe",
        email: "john@example.com",
      };

      const result = deserializeEntity(User, plain);

      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe("123"); // 문자열 그대로 유지
      expect(typeof result.id).toBe("string");
    });

    it("날짜 문자열을 Date 객체로 변환하지 않아야 함 (기본 동작)", () => {
      class Post {
        @Expose()
        id!: number;

        @Expose()
        createdAt!: Date;
      }

      const plain = {
        id: 1,
        createdAt: "2024-01-01T00:00:00Z",
      };

      const result = deserializeEntity(Post, plain);

      expect(result).toBeInstanceOf(Post);
      expect(typeof result.createdAt).toBe("string"); // 문자열 그대로 유지
    });
  });

  describe("에러 케이스", () => {
    it("생성자가 없는 객체를 처리해야 함", () => {
      const PlainClass = function (this: any) {
        this.id = 0;
      } as any;

      const plain = { id: 1, name: "Test" };

      expect(() => {
        deserializeEntity(PlainClass, plain);
      }).not.toThrow();
    });
  });

  describe("복잡한 시나리오", () => {
    it("다수의 중첩 객체와 배열을 처리해야 함", () => {
      class Comment {
        @Expose()
        id!: number;

        @Expose()
        text!: string;
      }

      class Post {
        @Expose()
        id!: number;

        @Expose()
        title!: string;

        comments?: Comment[];
      }

      const plain = {
        id: 1,
        title: "Test Post",
        comments: [
          { id: 1, text: "Comment 1" },
          { id: 2, text: "Comment 2" },
        ],
      };

      const result = deserializeEntity(Post, plain);

      expect(result).toBeInstanceOf(Post);
      expect(result.id).toBe(1);
      expect(result.comments).toBeDefined();
      expect(result.comments).toHaveLength(2);
    });
  });
});
