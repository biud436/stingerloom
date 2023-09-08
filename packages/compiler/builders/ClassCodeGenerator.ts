/* eslint-disable @typescript-eslint/no-explicit-any */
import ts from "typescript";
import fs from "fs";
import path from "path";

type IImportDeclaration = {
    name: string;
    path: string;
    type?: string;
};

export class ClassCodeGenerator {
    private statements: ts.Statement[];

    constructor(
        private readonly imported: IImportDeclaration[],
        private readonly routerName: string,
    ) {
        this.statements = [];
    }

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

    private appendEmptyLine() {
        return ts.factory.createIdentifier("\n") as any;
    }

    private addDecorator(decoratorName: string, content?: string) {
        return ts.factory.createDecorator(
            ts.factory.createCallExpression(
                ts.factory.createIdentifier(decoratorName),
                undefined,
                content ? [ts.factory.createStringLiteral(content)] : [],
            ),
        );
    }

    private addControllerDecorator(path: string) {
        return this.addDecorator("Controller", path);
    }

    private addGetDecorator(path: string) {
        return this.addDecorator("Get", path);
    }

    public toPascalCase(str: string) {
        return `${str[0].toUpperCase()}${str.slice(1)}`;
    }

    public toCamelCase(str: string) {
        return `${str[0].toLowerCase()}${str.slice(1)}`;
    }

    public findProvider(): IImportDeclaration {
        return this.imported.find((imp) => imp.type === "service")!;
    }

    public generateControllerFile() {
        const importDelcarations = this.addImports(this.imported);
        const provider = this.findProvider();
        const constructorNode = this.createConstructorContainsNamedParameter(
            this.toCamelCase(provider?.name),
            this.toPascalCase(provider?.name),
        );

        const classDeclaration = ts.factory.createClassDeclaration(
            [
                this.addControllerDecorator(`/${this.routerName}`),
                ts.factory.createToken(ts.SyntaxKind.ExportKeyword),
            ],
            ts.factory.createIdentifier(
                `${this.toPascalCase(this.routerName)}Controller`,
            ),
            undefined,
            undefined,
            [
                constructorNode,
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

    private generateFile() {
        const resultFile = ts.createSourceFile(
            "testController.ts",
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

        const filePath = path.resolve(__dirname, "TestController.ts");

        const result = printer.printNode(
            ts.EmitHint.Unspecified,
            sourceFile,
            resultFile,
        );

        fs.writeFileSync(filePath, result);
    }
}
