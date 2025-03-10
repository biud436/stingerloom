// __test__/e2e/core/module-topology-sort.spec.ts

import "reflect-metadata";
import {
  CircularDependencyError,
  Module,
  ModuleDependencyResolver,
} from "@stingerloom/core";
import { CircularModuleBWithCycleExtended } from "./circular-module-b-with-cycle-extended";

// 테스트용 모듈 정의
@Module({
  controllers: [],
  providers: [],
})
class DatabaseModule {}

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [],
})
class UserModule {}

@Module({
  imports: [UserModule],
  controllers: [],
  providers: [],
})
class AuthModule {}

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [],
  providers: [],
})
class AppModule {}

@Module({
  controllers: [],
  providers: [],
})
class NoImportModule {}

describe("ModuleTopologySort", () => {
  describe("기본 위상 정렬", () => {
    it("모듈을 의존성에 따라 정렬해야 합니다", () => {
      const sorter = new ModuleDependencyResolver(AppModule);
      const sortedModules = sorter.sort();

      const expectedOrder = [DatabaseModule, UserModule, AuthModule, AppModule];

      expect(sortedModules).toEqual(expectedOrder);
    });

    it("임포트가 없는 모듈을 처리해야 합니다", () => {
      const sorter = new ModuleDependencyResolver(NoImportModule);
      const sortedModules = sorter.sort();

      const expectedOrder = [NoImportModule];

      expect(sortedModules).toEqual(expectedOrder);
    });

    it("여러 임포트가 있는 모듈을 올바르게 정렬해야 합니다", () => {
      @Module({
        imports: [AuthModule, UserModule],
        controllers: [],
        providers: [],
      })
      class ComplexModule {}

      const sorter = new ModuleDependencyResolver(ComplexModule);
      const sortedModules = sorter.sort();

      const expectedOrder = [
        DatabaseModule,
        UserModule,
        AuthModule,
        ComplexModule,
      ];

      expect(sortedModules).toEqual(expectedOrder);
    });
  });

  describe("순환 의존성 감지", () => {
    it("순환 의존성이 감지되면 CircularDependencyError를 발생시켜야 합니다", () => {
      expect(() => {
        const sorter = new ModuleDependencyResolver(
          CircularModuleBWithCycleExtended,
        );
        sorter.sort();
      }).toThrowError(CircularDependencyError);
    });
  });

  describe("복잡한 의존성 그래프", () => {
    it("복잡한 의존성 그래프를 올바르게 정렬해야 합니다", () => {
      @Module({
        imports: [UserModule, AuthModule],
        controllers: [],
        providers: [],
      })
      class FeatureModule {}

      @Module({
        imports: [FeatureModule, DatabaseModule],
        controllers: [],
        providers: [],
      })
      class MainModule {}

      const sorter = new ModuleDependencyResolver(MainModule);
      const sortedModules = sorter.sort();

      const expectedOrder = [
        DatabaseModule,
        UserModule,
        AuthModule,
        FeatureModule,
        MainModule,
      ];

      expect(sortedModules).toEqual(expectedOrder);
    });
  });

  describe("엣지 케이스", () => {
    it("임포트 배열이 비어 있는 모듈을 처리해야 합니다", () => {
      @Module({
        imports: [],
        controllers: [],
        providers: [],
      })
      class EmptyImportsModule {}

      const sorter = new ModuleDependencyResolver(EmptyImportsModule);
      const sortedModules = sorter.sort();

      const expectedOrder = [EmptyImportsModule];

      expect(sortedModules).toEqual(expectedOrder);
    });

    it("모듈 옵션이 누락된 경우 오류를 발생시켜야 합니다", () => {
      class UndecoratedModule {}

      expect(() => {
        const sorter = new ModuleDependencyResolver(UndecoratedModule);
        sorter.sort();
      }).toThrowError(/ModuleOptions not found for module/);
    });
  });
});
