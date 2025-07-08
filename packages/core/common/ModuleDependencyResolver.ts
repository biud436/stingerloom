/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import { DynamicModuleOption, Module, MODULE_OPTIONS_TOKEN } from "./Module";
import { ClazzType } from "./RouterMapper";

export class ModuleNode {
  moduleClass: ClazzType;
  imports: ModuleNode[];

  constructor(moduleClass: ClazzType, imports: ModuleNode[] = []) {
    this.moduleClass = moduleClass;
    this.imports = imports;
  }
}

export class CircularDependencyError extends Error {}

export class ModuleDependencyResolver {
  private sortedModules: ClazzType[] = [];
  private visited: Set<ClazzType> = new Set();
  private tempMarked: Set<ClazzType> = new Set();
  private root: ClazzType;

  constructor(root: ClazzType) {
    console.log(
      `ModuleDependencyResolver initialized with root module: `,
      root,
    );

    this.root = root;
  }

  sort(): ClazzType[] {
    this.visit(this.root);
    return this.sortedModules;
  }

  private visit(moduleClass: ClazzType) {
    if (this.visited.has(moduleClass)) {
      return;
    }

    if (this.tempMarked.has(moduleClass)) {
      throw new CircularDependencyError(
        `Circular dependency detected: ${moduleClass.name}`,
      );
    }

    this.tempMarked.add(moduleClass);

    const moduleOptions = this.getModuleOptions(moduleClass);
    if (moduleOptions.imports) {
      for (const importedModule of moduleOptions.imports) {
        if (importedModule instanceof Function) {
          this.visit(importedModule as ClazzType);
        } else {
          /**
           * 런타임에 생성되는 동적 모듈을 처리합니다.
           */
          @Module({
            ...importedModule,
          })
          class DynamicModule {}

          this.visit(DynamicModule);
        }
      }
    }

    this.tempMarked.delete(moduleClass);
    this.visited.add(moduleClass);
    this.sortedModules.push(moduleClass);
  }

  private getModuleOptions(moduleClass: ClazzType): DynamicModuleOption {
    try {
      const options: DynamicModuleOption = Reflect.getMetadata(
        MODULE_OPTIONS_TOKEN,
        moduleClass,
      );
      if (!options) {
        throw new Error(
          `ModuleOptions not found for module: ${moduleClass.name}`,
        );
      }
      return options;
    } catch (error) {
      const e = error as Error;
      if (e.name === "TypeError") {
        throw new CircularDependencyError(
          `Circular dependency detected: ${moduleClass.name}`,
        );
      }
      throw error;
    }
  }
}
