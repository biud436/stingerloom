import { Conditions } from "@stingerloom/core/orm/core/Conditions";
import sql from "sql-template-tag";

describe("Conditions - 추가 테스트", () => {
  describe("집계 함수", () => {
    it("aggregate 함수는 일반 집계 함수를 생성해야 함", () => {
      const condition = Conditions.aggregate("MAX", "price");

      expect(condition.sql).toBe("MAX(price)");
      expect(condition.values).toEqual([]);
    });

    it("count 함수는 COUNT 집계를 생성해야 함", () => {
      const condition = Conditions.count("id");

      expect(condition.sql).toBe("COUNT(id)");
      expect(condition.values).toEqual([]);
    });

    it("count 함수에 *를 사용할 수 있어야 함", () => {
      const condition = Conditions.count("*");

      expect(condition.sql).toBe("COUNT(*)");
      expect(condition.values).toEqual([]);
    });

    it("sum 함수는 SUM 집계를 생성해야 함", () => {
      const condition = Conditions.sum("amount");

      expect(condition.sql).toBe("SUM(amount)");
      expect(condition.values).toEqual([]);
    });

    it("avg 함수는 AVG 집계를 생성해야 함", () => {
      const condition = Conditions.avg("rating");

      expect(condition.sql).toBe("AVG(rating)");
      expect(condition.values).toEqual([]);
    });
  });

  describe("서브쿼리 조건", () => {
    it("inSubquery는 IN (subquery) 조건을 생성해야 함", () => {
      const subquery = sql`(SELECT id FROM active_users)`;
      const condition = Conditions.inSubquery("user_id", subquery);

      expect(condition.sql).toBe("user_id IN (SELECT id FROM active_users)");
    });

    it("notInSubquery는 NOT IN (subquery) 조건을 생성해야 함", () => {
      const subquery = sql`(SELECT id FROM banned_users)`;
      const condition = Conditions.notInSubquery("user_id", subquery);

      expect(condition.sql).toBe(
        "user_id NOT IN (SELECT id FROM banned_users)",
      );
    });

    it("exists는 EXISTS 조건을 생성해야 함", () => {
      const subquery = sql`(SELECT 1 FROM orders WHERE user_id = users.id)`;
      const condition = Conditions.exists(subquery);

      expect(condition.sql).toBe(
        "EXISTS (SELECT 1 FROM orders WHERE user_id = users.id)",
      );
    });

    it("exists는 이미 EXISTS가 포함된 경우 중복 추가하지 않아야 함", () => {
      const subquery = sql`EXISTS (SELECT 1 FROM orders)`;
      const condition = Conditions.exists(subquery);

      expect(condition.sql).toBe("EXISTS (SELECT 1 FROM orders)");
    });

    it("notExists는 NOT EXISTS 조건을 생성해야 함", () => {
      const subquery = sql`(SELECT 1 FROM orders WHERE user_id = users.id)`;
      const condition = Conditions.notExists(subquery);

      expect(condition.sql).toBe(
        "NOT EXISTS (SELECT 1 FROM orders WHERE user_id = users.id)",
      );
    });
  });

  describe("조건 결합", () => {
    it("and는 여러 조건을 AND로 결합해야 함", () => {
      const conditions = [
        Conditions.equals("status", "active"),
        Conditions.gt("age", 18),
        Conditions.isNotNull("email"),
      ];

      const result = Conditions.and(conditions);

      expect(result.sql).toBe("(status = ? AND age > ? AND email IS NOT NULL)");
      expect(result.values).toEqual(["active", 18]);
    });

    it("or는 여러 조건을 OR로 결합해야 함", () => {
      const conditions = [
        Conditions.equals("role", "admin"),
        Conditions.equals("role", "moderator"),
      ];

      const result = Conditions.or(conditions);

      expect(result.sql).toBe("(role = ? OR role = ?)");
      expect(result.values).toEqual(["admin", "moderator"]);
    });

    it("and와 or를 중첩해서 사용할 수 있어야 함", () => {
      const ageConditions = Conditions.or([
        Conditions.lt("age", 18),
        Conditions.gt("age", 65),
      ]);

      const result = Conditions.and([
        Conditions.equals("country", "US"),
        ageConditions,
      ]);

      expect(result.sql).toContain("country = ?");
      expect(result.sql).toContain("AND");
      expect(result.sql).toContain("age < ?");
      expect(result.sql).toContain("OR");
      expect(result.sql).toContain("age > ?");
      expect(result.values).toEqual(["US", 18, 65]);
    });
  });

  describe("raw 조건", () => {
    it("raw는 임의의 SQL 조건을 생성해야 함", () => {
      const condition = Conditions.raw("DATE(created_at) = CURDATE()");

      expect(condition.sql).toBe("DATE(created_at) = CURDATE()");
      expect(condition.values).toEqual([]);
    });

    it("raw는 복잡한 SQL 표현식을 처리해야 함", () => {
      const condition = Conditions.raw(
        "CONCAT(first_name, ' ', last_name) LIKE '%John%'",
      );

      expect(condition.sql).toBe(
        "CONCAT(first_name, ' ', last_name) LIKE '%John%'",
      );
      expect(condition.values).toEqual([]);
    });
  });

  describe("비교 연산자 - Sql 타입 지원", () => {
    it("gt는 Sql 타입의 컬럼을 지원해야 함", () => {
      const column = sql`DATE(created_at)`;
      const condition = Conditions.gt(column, "2024-01-01");

      expect(condition.sql).toContain("DATE(created_at)");
      expect(condition.sql).toContain(">");
      expect(condition.values).toContain("2024-01-01");
    });

    it("lt는 Sql 타입의 컬럼을 지원해야 함", () => {
      const column = sql`YEAR(created_at)`;
      const condition = Conditions.lt(column, 2024);

      expect(condition.sql).toContain("YEAR(created_at)");
      expect(condition.sql).toContain("<");
      expect(condition.values).toContain(2024);
    });
  });

  describe("실전 시나리오", () => {
    it("복잡한 사용자 필터링 쿼리를 생성할 수 있어야 함", () => {
      const ageCondition = Conditions.between("age", 18, 65);
      const statusCondition = Conditions.in("status", ["active", "pending"]);
      const emailCondition = Conditions.isNotNull("email");
      const premiumCondition = Conditions.equals("is_premium", true);

      const allConditions = Conditions.and([
        ageCondition,
        statusCondition,
        emailCondition,
        Conditions.or([premiumCondition, Conditions.gt("credit", 100)]),
      ]);

      expect(allConditions.sql).toContain("age BETWEEN");
      expect(allConditions.sql).toContain("status IN");
      expect(allConditions.sql).toContain("email IS NOT NULL");
      expect(allConditions.sql).toContain("is_premium = ?");
      expect(allConditions.sql).toContain("credit > ?");
      expect(allConditions.values).toContain(18);
      expect(allConditions.values).toContain(65);
      expect(allConditions.values).toContain("active");
      expect(allConditions.values).toContain("pending");
      expect(allConditions.values).toContain(true);
      expect(allConditions.values).toContain(100);
    });

    it("검색 기능 쿼리를 생성할 수 있어야 함", () => {
      const searchConditions = Conditions.or([
        Conditions.like("title", "%검색어%"),
        Conditions.like("content", "%검색어%"),
        Conditions.like("author_name", "%검색어%"),
      ]);

      const result = Conditions.and([
        Conditions.equals("published", true),
        searchConditions,
      ]);

      expect(result.sql).toContain("published = ?");
      expect(result.sql).toContain("title LIKE ?");
      expect(result.sql).toContain("content LIKE ?");
      expect(result.sql).toContain("author_name LIKE ?");
      expect(result.values).toEqual([true, "%검색어%", "%검색어%", "%검색어%"]);
    });

    it("집계와 조건을 결합한 쿼리를 생성할 수 있어야 함", () => {
      const countCondition = Conditions.gt(Conditions.count("*"), 5);

      // COUNT(*)는 집계 함수이므로 HAVING 절에서 사용
      expect(countCondition.sql).toContain("COUNT(*)");
      expect(countCondition.sql).toContain(">");
      expect(countCondition.values).toContain(5);
    });
  });

  describe("특수 케이스", () => {
    it("NULL 값을 올바르게 처리해야 함", () => {
      const condition = Conditions.equals("optional_field", null);

      expect(condition.sql).toBe("optional_field = ?");
      expect(condition.values).toEqual([null]);
    });

    it("빈 문자열을 올바르게 처리해야 함", () => {
      const condition = Conditions.equals("name", "");

      expect(condition.sql).toBe("name = ?");
      expect(condition.values).toEqual([""]);
    });

    it("0 값을 올바르게 처리해야 함", () => {
      const condition = Conditions.equals("count", 0);

      expect(condition.sql).toBe("count = ?");
      expect(condition.values).toEqual([0]);
    });

    it("false 값을 올바르게 처리해야 함", () => {
      const condition = Conditions.equals("is_active", false);

      expect(condition.sql).toBe("is_active = ?");
      expect(condition.values).toEqual([false]);
    });

    it("배열에 중복 값이 있어도 처리해야 함", () => {
      const condition = Conditions.in("status", [
        "active",
        "active",
        "pending",
      ]);

      expect(condition.sql).toBe("status IN (?, ?, ?)");
      expect(condition.values).toEqual(["active", "active", "pending"]);
    });
  });

  describe("에러 상황 방어", () => {
    it("특수 문자가 포함된 컬럼명을 처리해야 함", () => {
      const condition = Conditions.equals("user.email", "test@example.com");

      expect(condition.sql).toBe("user.email = ?");
      expect(condition.values).toEqual(["test@example.com"]);
    });

    it("백틱이 포함된 컬럼명을 처리해야 함", () => {
      const condition = Conditions.equals("`order`", "DESC");

      expect(condition.sql).toBe("`order` = ?");
      expect(condition.values).toEqual(["DESC"]);
    });

    it("매우 긴 문자열을 처리해야 함", () => {
      const longString = "a".repeat(10000);
      const condition = Conditions.equals("description", longString);

      expect(condition.sql).toBe("description = ?");
      expect(condition.values).toEqual([longString]);
    });
  });
});
