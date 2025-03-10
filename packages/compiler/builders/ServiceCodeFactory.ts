import { IImportDeclaration } from "./ClassCodeGenerator";
import { InjectableCodeGenerator } from "./InjectableCodeGenerator";
import { ControllerCodeFactory } from "./ControllerCodeFactory";

export class ServiceCodeFactory extends ControllerCodeFactory {
  /**
   * 코드 생성기를 생성합니다.
   *
   * @param routerName
   */
  protected override createCodeGenerator(routerName: string) {
    const imported: IImportDeclaration[] = [
      {
        name: "Injectable",
        path: "@stingerloom/common",
      },
    ];
    const options = {
      isController: false,
      isInjectable: true,
    };

    this.codeGenerator = new InjectableCodeGenerator(
      imported,
      routerName,
      options,
    );
  }

  public build() {
    this.codeGenerator.generateServiceFile();

    return true;
  }
}
