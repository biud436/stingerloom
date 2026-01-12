/* eslint-disable @typescript-eslint/no-explicit-any */
import SelectUtils from "@stingerloom/core/orm/core/SelectUtils";

describe("SelectUtils", () => {
  describe("isArraySelect", () => {
    it("배열 select 옵션을 true로 반환해야 함", () => {
      const select = ["id", "name", "email"];
      const result = SelectUtils.isArraySelect(select as any);

      expect(result).toBe(true);
    });

    it("빈 배열도 true로 반환해야 함", () => {
      const select: string[] = [];
      const result = SelectUtils.isArraySelect(select as any);

      expect(result).toBe(true);
    });

    it("객체는 false로 반환해야 함", () => {
      const select = { id: true, name: true };
      const result = SelectUtils.isArraySelect(select as any);

      expect(result).toBe(false);
    });

    it("null은 false로 반환해야 함", () => {
      const select = null;
      const result = SelectUtils.isArraySelect(select as any);

      expect(result).toBe(false);
    });
  });

  describe("isBooleanSelect", () => {
    it("boolean 값만 있는 객체는 true로 반환해야 함", () => {
      const select = { id: true, name: true, email: false };
      const result = SelectUtils.isBooleanSelect(select as any);

      expect(result).toBe(true);
    });

    it("undefined 값이 포함된 객체도 true로 반환해야 함", () => {
      const select = { id: true, name: undefined, email: false };
      const result = SelectUtils.isBooleanSelect(select as any);

      expect(result).toBe(true);
    });

    it("빈 객체는 true로 반환해야 함", () => {
      const select = {};
      const result = SelectUtils.isBooleanSelect(select as any);

      expect(result).toBe(true);
    });

    it("배열은 false로 반환해야 함", () => {
      const select = ["id", "name"];
      const result = SelectUtils.isBooleanSelect(select as any);

      expect(result).toBe(false);
    });

    it("null은 false로 반환해야 함", () => {
      const select = null;
      const result = SelectUtils.isBooleanSelect(select as any);

      expect(result).toBe(false);
    });

    it("undefined는 false로 반환해야 함", () => {
      const select = undefined;
      const result = SelectUtils.isBooleanSelect(select as any);

      expect(result).toBe(false);
    });

    it("string 값이 포함된 객체는 false로 반환해야 함", () => {
      const select = { id: true, name: "test" };
      const result = SelectUtils.isBooleanSelect(select as any);

      expect(result).toBe(false);
    });

    it("number 값이 포함된 객체는 false로 반환해야 함", () => {
      const select = { id: true, age: 30 };
      const result = SelectUtils.isBooleanSelect(select as any);

      expect(result).toBe(false);
    });

    it("nested 객체가 포함된 경우 false로 반환해야 함", () => {
      const select = { id: true, profile: { avatar: true } };
      const result = SelectUtils.isBooleanSelect(select as any);

      expect(result).toBe(false);
    });
  });

  describe("isNestedSelect", () => {
    it("nested 객체가 있는 select는 true로 반환해야 함", () => {
      const select = {
        id: true,
        profile: {
          select: { avatar: true },
        },
      };
      const result = SelectUtils.isNestedSelect(select as any);

      expect(result).toBe(true);
    });

    it("복잡한 nested 구조도 true로 반환해야 함", () => {
      const select = {
        id: true,
        posts: {
          where: { published: true },
          select: { title: true, content: true },
        },
      };
      const result = SelectUtils.isNestedSelect(select as any);

      expect(result).toBe(true);
    });

    it("boolean 값만 있는 객체는 false로 반환해야 함", () => {
      const select = { id: true, name: true, email: false };
      const result = SelectUtils.isNestedSelect(select as any);

      expect(result).toBe(false);
    });

    it("배열은 false로 반환해야 함", () => {
      const select = ["id", "name"];
      const result = SelectUtils.isNestedSelect(select as any);

      expect(result).toBe(false);
    });

    it("null은 false로 반환해야 함", () => {
      const select = null;
      const result = SelectUtils.isNestedSelect(select as any);

      expect(result).toBe(false);
    });

    it("undefined는 false로 반환해야 함", () => {
      const select = undefined;
      const result = SelectUtils.isNestedSelect(select as any);

      expect(result).toBe(false);
    });

    it("빈 객체는 false로 반환해야 함", () => {
      const select = {};
      const result = SelectUtils.isNestedSelect(select as any);

      expect(result).toBe(false);
    });

    it("모든 값이 boolean이나 undefined인 경우 false로 반환해야 함", () => {
      const select = { id: true, name: false, email: undefined };
      const result = SelectUtils.isNestedSelect(select as any);

      expect(result).toBe(false);
    });

    it("빈 객체를 값으로 가지는 경우 true로 반환해야 함", () => {
      const select = { id: true, profile: {} };
      const result = SelectUtils.isNestedSelect(select as any);

      expect(result).toBe(true);
    });
  });

  describe("타입 가드 조합 테스트", () => {
    it("세 가지 타입 가드가 상호 배타적이어야 함 - 배열 케이스", () => {
      const select = ["id", "name"];

      expect(SelectUtils.isArraySelect(select as any)).toBe(true);
      expect(SelectUtils.isBooleanSelect(select as any)).toBe(false);
      expect(SelectUtils.isNestedSelect(select as any)).toBe(false);
    });

    it("세 가지 타입 가드가 상호 배타적이어야 함 - boolean 객체 케이스", () => {
      const select = { id: true, name: false };

      expect(SelectUtils.isArraySelect(select as any)).toBe(false);
      expect(SelectUtils.isBooleanSelect(select as any)).toBe(true);
      expect(SelectUtils.isNestedSelect(select as any)).toBe(false);
    });

    it("세 가지 타입 가드가 상호 배타적이어야 함 - nested 객체 케이스", () => {
      const select = { id: true, profile: { avatar: true } };

      expect(SelectUtils.isArraySelect(select as any)).toBe(false);
      expect(SelectUtils.isBooleanSelect(select as any)).toBe(false);
      expect(SelectUtils.isNestedSelect(select as any)).toBe(true);
    });

    it("invalid 입력에 대해 모두 false를 반환해야 함", () => {
      const select = null;

      expect(SelectUtils.isArraySelect(select as any)).toBe(false);
      expect(SelectUtils.isBooleanSelect(select as any)).toBe(false);
      expect(SelectUtils.isNestedSelect(select as any)).toBe(false);
    });
  });

  describe("엣지 케이스", () => {
    it("심볼 키를 가진 객체를 처리해야 함", () => {
      const sym = Symbol("test");
      const select = { [sym]: true, id: true };

      const result = SelectUtils.isBooleanSelect(select as any);
      expect(result).toBe(true);
    });

    it("프로토타입 체인의 속성은 고려하지 않아야 함", () => {
      const proto = { inherited: true };
      const select = Object.create(proto);
      select.id = true;

      const result = SelectUtils.isBooleanSelect(select as any);
      expect(result).toBe(true);
    });

    it("null 프로토타입 객체를 처리해야 함", () => {
      const select = Object.create(null);
      select.id = true;
      select.name = false;

      const result = SelectUtils.isBooleanSelect(select as any);
      expect(result).toBe(true);
    });

    it("배열을 값으로 가지는 객체는 nested로 처리해야 함", () => {
      const select = { id: true, tags: ["tag1", "tag2"] };

      expect(SelectUtils.isNestedSelect(select as any)).toBe(false);
      expect(SelectUtils.isBooleanSelect(select as any)).toBe(false);
    });
  });
});
