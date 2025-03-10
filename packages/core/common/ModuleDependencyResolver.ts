/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import { DynamicModuleOption, MODULE_OPTIONS_TOKEN } from "./Module";
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

  constructor(private root: ClazzType) {}

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
        this.visit(importedModule as ClazzType);
      }
    }

    this.tempMarked.delete(moduleClass);
    this.visited.add(moduleClass);
    this.sortedModules.push(moduleClass);
  }

  private getModuleOptions(moduleClass: ClazzType): DynamicModuleOption {
    try {
      const getOptions = () => {
        return Reflect.getMetadata(MODULE_OPTIONS_TOKEN, moduleClass);
      };

      const options: DynamicModuleOption = getOptions();
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
