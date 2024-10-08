import ts from "typescript";
export type IImportDeclaration = {
    name: string;
    path: string;
    type?: string;
};
/**
 * @class ClassCodeGenerator
 * @author biud436
 * @description
 * 본 클래스를 사용하면 컨트롤러 파일을 타입스크립트 컴파일러 수준에서 생성할 수 있습니다.
 */
export declare class ClassCodeGenerator {
    protected readonly imported: IImportDeclaration[];
    protected readonly routerName: string;
    protected readonly options?: {
        isController?: boolean | undefined;
        isInjectable?: boolean | undefined;
    } | undefined;
    protected statements: ts.Statement[];
    constructor(imported: IImportDeclaration[], routerName: string, options?: {
        isController?: boolean | undefined;
        isInjectable?: boolean | undefined;
    } | undefined);
    /**
     * import 문을 추가합니다.
     *
     * @param imported
     * @returns
     */
    protected addImports(imported: IImportDeclaration[]): ts.ImportDeclaration[];
    /**
     * 생성자를 추가합니다.
     *
     * @param name
     * @param clazzName
     * @returns
     */
    protected createConstructorContainsNamedParameter(name: string, clazzName: string): ts.ConstructorDeclaration;
    /**
     * 개행 문자를 추가합니다.
     *
     * @returns
     */
    protected appendEmptyLine(): any;
    /**
     * 데코레이터를 추가합니다.
     *
     * @param decoratorName
     * @param content
     * @returns
     */
    protected addDecorator(decoratorName: string, content?: string): ts.Decorator;
    /**
     * 컨트롤러 데코레이터를 추가합니다.
     *
     * @param path
     * @returns
     */
    protected addControllerDecorator(path: string): ts.Decorator;
    /**
     * Get 데코레이터를 추가합니다.
     *
     * @param path
     * @returns
     */
    protected addGetDecorator(path: string): ts.Decorator;
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
     * 생성자 주입 시 사용될 프로바이더를 검색합니다.
     *
     * @returns
     */
    findProvider(): IImportDeclaration;
    /**
     * ClassModifier를 추가합니다.
     * @returns
     */
    protected addClassModifier(): (ts.Decorator | ts.ModifierToken<ts.SyntaxKind.ExportKeyword>)[];
    /**
     * 타입스크립트 AST를 생성합니다.
     */
    generateControllerFile(): void;
    generateServiceFile(): void;
    /**
     * 파일을 생성합니다.
     */
    protected generateFile(): void;
    /**
     * 파일명을 파스칼 케이스로 가져옵니다.
     *
     * @returns
     */
    protected getFilename(): string;
}
