/* eslint-disable @typescript-eslint/no-explicit-any */
import ts from "typescript";
import fs from "fs";
import path from "path";

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
export class ClassCodeGenerator {
    private statements: ts.Statement[];

    constructor(
        private readonly imported: IImportDeclaration[],
        private readonly routerName: string,
        private readonly options?: {
            isController?: boolean;
        },
    ) {
        this.statements = [];
    }

    /**
     * import 문을 추가합니다.
     *
     * @param imported
     * @returns
     */
    private addImports(imported: IImportDeclaration[]) {
        return imported.map((imp) => {
            return ts.factory.createImportDeclaration(
                undefined,
                ts.factory.createImportClause(
                    false,
                    undefined,
                    ts.factory.createNamedImports([
                        ts.factory.createImportSpecifier(
                            false,
                            undefined,
                            ts.factory.createIdentifier(imp.name),
                        ),
                    ]),
                ),
                ts.factory.createStringLiteral(imp.path),
            );
        });
    }

    /**
     * 생성자를 추가합니다.
     *
     * @param name
     * @param clazzName
     * @returns
     */
    private createConstructorContainsNamedParameter(
        name: string,
        clazzName: string,
    ) {
        return ts.factory.createConstructorDeclaration(
            undefined,
            [
                ts.factory.createParameterDeclaration(
                    ts.factory.createModifiersFromModifierFlags(
                        ts.ModifierFlags.Private | ts.ModifierFlags.Readonly,
                    ),
                    undefined,
                    ts.factory.createIdentifier(name),
                    undefined,
                    ts.factory.createTypeReferenceNode(
                        ts.factory.createIdentifier(clazzName),
                        undefined,
                    ),
                ),
            ],
            ts.factory.createBlock([], false),
        );
    }

    /**
     * 개행 문자를 추가합니다.
     *
     * @returns
     */
    private appendEmptyLine() {
        return ts.factory.createIdentifier("\n") as any;
    }

    /**
     * 데코레이터를 추가합니다.
     *
     * @param decoratorName
     * @param content
     * @returns
     */
    private addDecorator(decoratorName: string, content?: string) {
        return ts.factory.createDecorator(
            ts.factory.createCallExpression(
                ts.factory.createIdentifier(decoratorName),
                undefined,
                content ? [ts.factory.createStringLiteral(content)] : [],
            ),
        );
    }

    /**
     * 컨트롤러 데코레이터를 추가합니다.
     *
     * @param path
     * @returns
     */
    private addControllerDecorator(path: string) {
        return this.addDecorator("Controller", path);
    }

    /**
     * Get 데코레이터를 추가합니다.
     *
     * @param path
     * @returns
     */
    private addGetDecorator(path: string) {
        return this.addDecorator("Get", path);
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
     * 생성자 주입 시 사용될 프로바이더를 검색합니다.
     *
     * @returns
     */
    public findProvider(): IImportDeclaration {
        return this.imported.find((imp) => imp.type === "service")!;
    }

    /**
     * ClassModifier를 추가합니다.
     * @returns
     */
    private addClassModifier() {
        const { isController } = this.options || {};

        return isController
            ? [
                  this.addControllerDecorator(`/${this.routerName}`),
                  ts.factory.createToken(ts.SyntaxKind.ExportKeyword),
              ]
            : [ts.factory.createToken(ts.SyntaxKind.ExportKeyword)];
    }

    /**
     * 타입스크립트 AST를 생성합니다.
     */
    public generateControllerFile() {
        const importDelcarations = this.addImports(this.imported);
        const provider = this.findProvider();
        const isController = this.options?.isController;
        const constructorNode = this.createConstructorContainsNamedParameter(
            this.toCamelCase(provider?.name),
            this.toPascalCase(provider?.name),
        );

        const classDeclaration = ts.factory.createClassDeclaration(
            this.addClassModifier(),
            ts.factory.createIdentifier(this.getFilename()),
            undefined,
            undefined,
            [
                isController ? constructorNode : undefined,
                this.appendEmptyLine(),
                ts.factory.createMethodDeclaration(
                    [
                        this.addGetDecorator("/"),
                        ts.factory.createToken(ts.SyntaxKind.PublicKeyword),
                        ts.factory.createToken(ts.SyntaxKind.AsyncKeyword),
                    ],
                    undefined,
                    ts.factory.createIdentifier(
                        `get${this.toPascalCase(this.routerName)}`,
                    ),
                    undefined,
                    undefined,
                    [],
                    undefined,
                    ts.factory.createBlock(
                        [
                            ts.factory.createReturnStatement(
                                ts.factory.createAwaitExpression(
                                    ts.factory.createCallExpression(
                                        ts.factory.createPropertyAccessExpression(
                                            ts.factory.createThis(),
                                            ts.factory.createIdentifier(
                                                this.toCamelCase(provider.name),
                                            ),
                                        ),
                                        undefined,
                                        [],
                                    ),
                                ),
                            ),
                        ],
                        true,
                    ),
                ),
                this.appendEmptyLine(),
            ],
        );

        this.statements.push(...importDelcarations);
        this.statements.push(this.appendEmptyLine());
        this.statements.push(classDeclaration);

        this.generateFile();
    }

    /**
     * 파일을 생성합니다.
     */
    private generateFile() {
        const filename = this.getFilename() + ".ts";
        const resultFile = ts.createSourceFile(
            filename,
            "",
            ts.ScriptTarget.Latest,
        );

        const printer = ts.createPrinter({
            newLine: ts.NewLineKind.CarriageReturnLineFeed,
        });

        const sourceFile = ts.factory.createSourceFile(
            this.statements,
            ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
            ts.NodeFlags.BlockScoped,
        );

        const filePath = path.resolve(__dirname, filename);

        const result = printer.printNode(
            ts.EmitHint.Unspecified,
            sourceFile,
            resultFile,
        );

        fs.writeFileSync(filePath, result);
    }

    /**
     * 파일명을 파스칼 케이스로 가져옵니다.
     *
     * @returns
     */
    private getFilename(): string {
        return `${this.toPascalCase(this.routerName)}Controller`;
    }
}
