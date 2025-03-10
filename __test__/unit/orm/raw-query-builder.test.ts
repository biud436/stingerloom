import { Conditions } from "@stingerloom/core/orm/core/Conditions";
import { RawQueryBuilderFactory } from "@stingerloom/core/orm/core/RawQueryBuilderFactory";

describe("RawQueryBuilder", () => {
  describe("select", () => {
    it("SELECT * 쿼리를 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select("*")
        .from("users")
        .build();

      expect(query.sql).toBe("SELECT * FROM users");
      expect(query.values).toEqual([]);
    });

    it("특정 컬럼들을 SELECT 해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select(["id", "name", "email"])
        .from("users")
        .build();

      expect(query.sql).toBe("SELECT id, name, email FROM users");
      expect(query.values).toEqual([]);
    });
  });

  describe("where", () => {
    it("단일 WHERE 조건으로 쿼리를 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select("*")
        .from("users")
        .where([Conditions.equals("id", 1)])
        .build();

      expect(query.sql).toBe("SELECT * FROM users WHERE id = ?");
      expect(query.values).toEqual([1]);
    });

    it("다중 WHERE 조건으로 쿼리를 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select("*")
        .from("users")
        .where([
          Conditions.equals("status", "active"),
          Conditions.gt("age", 18),
        ])
        .build();

      expect(query.sql).toBe(
        "SELECT * FROM users WHERE status = ? AND age > ?",
      );
      expect(query.values).toEqual(["active", 18]);
    });

    it("빈 WHERE 조건을 처리해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select("*")
        .from("users")
        .where([])
        .build();

      expect(query.sql).toBe("SELECT * FROM users WHERE 1=1");
      expect(query.values).toEqual([]);
    });
  });

  describe("orderBy", () => {
    it("단일 ORDER BY 절로 쿼리를 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select("*")
        .from("users")
        .orderBy([{ column: "created_at", direction: "DESC" }])
        .build();

      expect(query.sql).toBe("SELECT * FROM users ORDER BY created_at DESC");
      expect(query.values).toEqual([]);
    });

    it("다중 ORDER BY 절로 쿼리를 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select("*")
        .from("users")
        .orderBy([
          { column: "age", direction: "DESC" },
          { column: "name", direction: "ASC" },
        ])
        .build();

      expect(query.sql).toBe("SELECT * FROM users ORDER BY age DESC, name ASC");
      expect(query.values).toEqual([]);
    });
  });

  describe("limit", () => {
    it("단순 LIMIT 절로 쿼리를 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select("*")
        .from("users")
        .limit(10)
        .build();

      expect(query.sql).toBe("SELECT * FROM users LIMIT ?");
      expect(query.values).toEqual([10]);
    });

    it("OFFSET과 LIMIT이 포함된 쿼리를 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select("*")
        .from("users")
        .limit([5, 10])
        .build();

      expect(query.sql).toBe("SELECT * FROM users LIMIT ?, ?");
      expect(query.values).toEqual([5, 10]);
    });
  });

  describe("join", () => {
    it("INNER JOIN이 포함된 쿼리를 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select(["u.id", "u.name", "p.title"])
        .from("users", "u")
        .join("INNER", "posts", "p", Conditions.equals("u.id", "p.user_id"))
        .build();

      expect(query.sql).toBe(
        "SELECT u.id, u.name, p.title FROM users AS u INNER JOIN posts AS p ON u.id = ?",
      );
      expect(query.values).toEqual(["p.user_id"]);
    });

    it("다중 JOIN이 포함된 쿼리를 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select(["u.id", "u.name", "p.title", "c.content"])
        .from("users", "u")
        .join("LEFT", "posts", "p", Conditions.equals("u.id", "p.user_id"))
        .join("LEFT", "comments", "c", Conditions.equals("p.id", "c.post_id"))
        .build();

      expect(query.sql).toBe(
        "SELECT u.id, u.name, p.title, c.content " +
          "FROM users AS u " +
          "LEFT JOIN posts AS p ON u.id = ? " +
          "LEFT JOIN comments AS c ON p.id = ?",
      );
      expect(query.values).toEqual(["p.user_id", "c.post_id"]);
    });
  });

  describe("Conditions", () => {
    it("equals 조건을 생성해야 함", () => {
      const condition = Conditions.equals("name", "John");
      expect(condition.sql).toBe("name = ?");
      expect(condition.values).toEqual(["John"]);
    });

    it("IN 조건을 생성해야 함", () => {
      const condition = Conditions.in("status", ["active", "pending"]);
      expect(condition.sql).toBe("status IN (?, ?)");
      expect(condition.values).toEqual(["active", "pending"]);
    });

    it("LIKE 조건을 생성해야 함", () => {
      const condition = Conditions.like("email", "%@example.com");
      expect(condition.sql).toBe("email LIKE ?");
      expect(condition.values).toEqual(["%@example.com"]);
    });

    it("BETWEEN 조건을 생성해야 함", () => {
      const condition = Conditions.between("age", 18, 30);
      expect(condition.sql).toBe("age BETWEEN ? AND ?");
      expect(condition.values).toEqual([18, 30]);
    });

    it("OR 조건을 생성해야 함", () => {
      const condition = Conditions.or([
        Conditions.equals("status", "active"),
        Conditions.equals("status", "pending"),
      ]);
      expect(condition.sql).toBe("(status = ? OR status = ?)");
      expect(condition.values).toEqual(["active", "pending"]);
    });

    it("복잡한 AND/OR 조건을 생성해야 함", () => {
      const condition = Conditions.and([
        Conditions.equals("type", "user"),
        Conditions.or([
          Conditions.gte("age", 18),
          Conditions.equals("verified", true),
        ]),
      ]);
      expect(condition.sql).toBe("(type = ? AND (age >= ? OR verified = ?))");
      expect(condition.values).toEqual(["user", 18, true]);
    });
  });

  describe("복잡한 쿼리", () => {
    it("다중 조건과 조인이 포함된 복잡한 쿼리를 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select(["u.id", "u.name", "p.title"])
        .from("users", "u")
        .join("LEFT", "posts", "p", Conditions.equals("u.id", "p.user_id"))
        .where([
          Conditions.and([
            Conditions.gte("u.created_at", new Date("2024-01-01")),
            Conditions.or([
              Conditions.like("u.email", "%@example.com"),
              Conditions.like("u.email", "%@test.com"),
            ]),
          ]),
        ])
        .groupBy(["u.id", "u.name"])
        .having([Conditions.gt("COUNT(p.id)", 5)])
        .orderBy([{ column: "u.created_at", direction: "DESC" }])
        .limit([0, 10])
        .build();

      expect(query.sql).toContain("SELECT u.id, u.name, p.title");
      expect(query.sql).toContain("FROM users AS u");
      expect(query.sql).toContain("LEFT JOIN posts AS p ON u.id = ?");
      expect(query.sql).toContain("WHERE");
      expect(query.sql).toContain("GROUP BY u.id, u.name");
      expect(query.sql).toContain("HAVING COUNT(p.id) > ?");
      expect(query.sql).toContain("ORDER BY u.created_at DESC");
      expect(query.sql).toContain("LIMIT ?, ?");
    });
  });

  describe("데이터베이스별 LIMIT 구문", () => {
    it("MySQL LIMIT 구문을 올바르게 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .setDatabaseType("mysql")
        .select("*")
        .from("users")
        .limit([10, 5])
        .build();

      expect(query.sql).toBe("SELECT * FROM users LIMIT ?, ?");
      expect(query.values).toEqual([10, 5]);
    });

    it("PostgreSQL LIMIT 구문을 올바르게 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .setDatabaseType("postgresql")
        .select("*")
        .from("users")
        .limit([10, 5])
        .build();

      expect(query.sql).toBe("SELECT * FROM users LIMIT ? OFFSET ?");
      expect(query.values).toEqual([5, 10]);
    });
  });

  describe("GROUP BY와 HAVING 절", () => {
    it("GROUP BY와 HAVING 절이 포함된 쿼리를 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select([
          "department",
          Conditions.count("id").sql + " as employee_count",
          Conditions.avg("salary").sql + " as avg_salary",
        ])
        .from("employees")
        .groupBy(["department"])
        .having([
          Conditions.gt(Conditions.count("id"), 5),
          Conditions.gt(Conditions.avg("salary"), 50000),
        ])
        .build();

      expect(query.sql).toBe(
        "SELECT department, COUNT(id) as employee_count, AVG(salary) as avg_salary " +
          "FROM employees " +
          "GROUP BY department " +
          "HAVING COUNT(id) > ? AND AVG(salary) > ?",
      );
      expect(query.values).toEqual([5, 50000]);
    });

    it("집계 함수를 포함한 복잡한 쿼리를 생성해야 함", () => {
      const query = RawQueryBuilderFactory.create()
        .select([
          "u.department",
          "p.year",
          Conditions.sum("p.amount").sql + " as total_amount",
          Conditions.count("u.id").sql + " as user_count",
        ])
        .from("users", "u")
        .join("LEFT", "payments", "p", Conditions.equals("u.id", "p.user_id"))
        .where([Conditions.equals("p.status", "completed")])
        .groupBy(["u.department", "p.year"])
        .having([Conditions.gt(Conditions.sum("p.amount"), 1000000)])
        .orderBy([{ column: "total_amount", direction: "DESC" }])
        .build();

      const expectedSql = [
        "SELECT u.department, p.year, SUM(p.amount) as total_amount, COUNT(u.id) as user_count",
        "FROM users AS u",
        "LEFT JOIN payments AS p ON u.id = ?",
        "WHERE p.status = ?",
        "GROUP BY u.department, p.year",
        "HAVING SUM(p.amount) > ?",
        "ORDER BY total_amount DESC",
      ].join(" ");

      expect(query.sql).toBe(expectedSql);
      expect(query.values).toEqual(["p.user_id", "completed", 1000000]);
    });
  });

  describe("서브쿼리", () => {
    it("FROM 절에 서브쿼리를 포함한 쿼리를 생성해야 함", () => {
      const subquery = RawQueryBuilderFactory.subquery()
        .select(["department", Conditions.count("id").sql + " as emp_count"])
        .from("employees")
        .groupBy(["department"])
        .having([Conditions.gt(Conditions.count("id"), 5)])
        .as("d"); // 여기서 바로 'd'를 별칭으로 사용

      const query = RawQueryBuilderFactory.create()
        .select(["d.department", "d.emp_count"])
        .from(subquery.sql) // 별칭이 이미 포함되어 있으므로 from에서는 별칭 생략
        .where([Conditions.gt("d.emp_count", 10)])
        .orderBy([{ column: "d.emp_count", direction: "DESC" }])
        .build();

      const expectedSql = [
        "SELECT d.department, d.emp_count",
        "FROM (SELECT department, COUNT(id) as emp_count",
        "FROM employees",
        "GROUP BY department",
        "HAVING COUNT(id) > ?) AS d",
        "WHERE d.emp_count > ?",
        "ORDER BY d.emp_count DESC",
      ].join(" ");

      expect(query.sql).toBe(expectedSql);
      expect(query.values).toEqual([10]);
    });

    it("EXISTS를 사용한 서브쿼리를 생성해야 함", () => {
      const subquery = RawQueryBuilderFactory.subquery()
        .select(["1"])
        .from("orders")
        .where([
          Conditions.compareColumns("customer_id", "=", "c.id"),
          Conditions.gt("total_amount", 1000),
        ])
        .asExists();

      const query = RawQueryBuilderFactory.create()
        .select(["c.name", "c.email"])
        .from("customers", "c")
        .where([Conditions.exists(subquery)])
        .build();

      const expectedSql = [
        "SELECT c.name, c.email",
        "FROM customers AS c",
        "WHERE EXISTS (SELECT 1",
        "FROM orders",
        "WHERE customer_id = c.id AND total_amount > ?)",
      ].join(" ");

      expect(query.sql).toBe(expectedSql);
      expect(query.values).toEqual([1000]);
    });

    it("복잡한 중첩 서브쿼리를 생성해야 함", () => {
      const avgSalarySubquery = RawQueryBuilderFactory.subquery()
        .select([Conditions.avg("salary").sql])
        .from("employees")
        .asInQuery();

      const deptWithHighPaidSubquery = RawQueryBuilderFactory.subquery()
        .select(["department_id"])
        .from("employees")
        .where([Conditions.gt("salary", avgSalarySubquery)])
        .groupBy(["department_id"])
        .as("hpd"); // 여기서 바로 'hpd'를 별칭으로 사용

      const query = RawQueryBuilderFactory.create()
        .select(["d.name", "d.location"])
        .from("departments", "d")
        .join(
          "INNER",
          deptWithHighPaidSubquery.sql,
          "hpd",
          Conditions.compareColumns("d.id", "=", "hpd.department_id"),
        )
        .build();

      const expectedSql = [
        "SELECT d.name, d.location",
        "FROM departments AS d",
        "INNER JOIN (SELECT department_id",
        "FROM employees",
        "WHERE salary > (SELECT AVG(salary)",
        "FROM employees)",
        "GROUP BY department_id) AS hpd",
        "ON d.id = hpd.department_id",
      ].join(" ");

      expect(query.sql).toBe(expectedSql);
    });
  });
});
