/* eslint-disable @typescript-eslint/no-explicit-any */
import ts from "typescript";
import fs from "fs";
import path from "path";

const imports = [
    {
        name: "Controller",
        path: "@stingerloom/common/decorators/Controller",
    },
    { name: "TestService", path: "./TestService" },
    { name: "Get", path: "@stingerloom/common/decorators/Get" },
];

export function createBasicController() {
    const statements: ts.Statement[] = [];

    const importDelcarations = imports.map((imp) => {
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

    const constructorNode = createConstructor("testService", "TestService");

    const classDeclaration = ts.factory.createClassDeclaration(
        [
            addDecorator("Controller", "/test"),
            ts.factory.createToken(ts.SyntaxKind.ExportKeyword),
        ],
        ts.factory.createIdentifier("TestController"),
        undefined,
        undefined,
        [
            constructorNode,
            appendEmptyLine(),
            ts.factory.createMethodDeclaration(
                [
                    addDecorator("Get", "/"),
                    ts.factory.createToken(ts.SyntaxKind.PublicKeyword),
                    ts.factory.createToken(ts.SyntaxKind.AsyncKeyword),
                ],
                undefined,
                ts.factory.createIdentifier("getTest"),
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
                                            "testService",
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
            appendEmptyLine(),
        ],
    );

    statements.push(...importDelcarations);
    statements.push(appendEmptyLine());
    statements.push(classDeclaration);

    const resultFile = ts.createSourceFile(
        "testController.ts",
        "",
        ts.ScriptTarget.Latest,
    );

    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.CarriageReturnLineFeed,
    });

    const sourceFile = ts.factory.createSourceFile(
        statements,
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

    return result;
}

function addDecorator(decoratorName: string, content?: string) {
    return ts.factory.createDecorator(
        ts.factory.createCallExpression(
            ts.factory.createIdentifier(decoratorName),
            undefined,
            content ? [ts.factory.createStringLiteral(content)] : [],
        ),
    );
}

function createConstructor(name: string, clazzName: string) {
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

function appendEmptyLine() {
    return ts.factory.createIdentifier("\n") as any;
}

describe("createBasicController", () => {
    it("should create a basic controller", () => {
        expect(createBasicController()).toBeTruthy();
    });
});
