import ts from "typescript";
export type IStingerModule = {
  right?: ts.CallExpression;
  root?: ts.BinaryExpression;
};
/**
 * ServerBootstrapApplication 클래스를 상속한 클래스에서 모듈이 정의된 부분을 찾습니다.
 *
 * @param sourceFile
 * @returns
 */
export declare const findModuleOption: (
  sourceFile: ts.SourceFile,
) => (moduleRef?: IStingerModule) => IStingerModule;
