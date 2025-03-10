import { ClassCodeGenerator, IImportDeclaration } from "./ClassCodeGenerator";

export class ControllerCodeFactory {
  protected codeGenerator!: ClassCodeGenerator;

  constructor(routerName: string) {
    this.createCodeGenerator(routerName);
  }

  /**
   * 코드 생성기를 생성합니다.
   *
   * @param routerName
   */
  protected createCodeGenerator(routerName: string) {
    const serviceFileName = this.toPascalCase(routerName);
    const imported: IImportDeclaration[] = [
      {
        name: "Controller",
        path: "@stingerloom/common/decorators/Controller",
      },
      {
        name: serviceFileName,
        path: `./${serviceFileName}`,
        type: "service",
      },
      { name: "Get", path: "@stingerloom/common/decorators/Get" },
    ];
    const options = {
      isController: true,
    };

    this.codeGenerator = new ClassCodeGenerator(imported, routerName, options);
  }

  /**
   * 파스칼 케이스로 변환합니다.
   *
   * @param str
   * @returns
   */
  public toPascalCase(str: string) {
    return `${str[0].toUpperCase()}${str.slice(1)}`;
  }

  /**
   * 카멜 케이스로 변환합니다.
   *
   * @param str
   * @returns
   */
  public toCamelCase(str: string) {
    return `${str[0].toLowerCase()}${str.slice(1)}`;
  }

  /**
   * 파일을 생성합니다.
   */
  public build() {
    this.codeGenerator.generateControllerFile();

    return true;
  }
}
