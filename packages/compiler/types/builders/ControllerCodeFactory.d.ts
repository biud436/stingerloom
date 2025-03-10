import { ClassCodeGenerator } from "./ClassCodeGenerator";
export declare class ControllerCodeFactory {
  protected codeGenerator: ClassCodeGenerator;
  constructor(routerName: string);
  /**
   * 코드 생성기를 생성합니다.
   *
   * @param routerName
   */
  protected createCodeGenerator(routerName: string): void;
  /**
   * 파스칼 케이스로 변환합니다.
   *
   * @param str
   * @returns
   */
  toPascalCase(str: string): string;
  /**
   * 카멜 케이스로 변환합니다.
   *
   * @param str
   * @returns
   */
  toCamelCase(str: string): string;
  /**
   * 파일을 생성합니다.
   */
  build(): boolean;
}
