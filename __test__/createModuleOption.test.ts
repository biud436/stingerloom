/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ts from "typescript";
import fs from "fs";
import path from "path";

/**
 * @see
 * https://stackoverflow.com/questions/67723545/how-to-update-or-insert-to-import-using-typescript-compiler-api
 *
 * @returns
 */
export function createModuleOptions() {
    const moduleOptionsExpr = ts.factory.createExpressionStatement(
        ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createToken(ts.SyntaxKind.ThisKeyword),
                ts.factory.createIdentifier("moduleOptions"),
            ),
            ts.factory.createToken(ts.SyntaxKind.FirstAssignment),
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier("ModuleOptions"),
                    ts.factory.createIdentifier("merge"),
                ),
                undefined,
                [
                    ts.factory.createObjectLiteralExpression(
                        [
                            ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier("imports"),
                                ts.factory.createArrayLiteralExpression(
                                    [
                                        ts.factory.createObjectLiteralExpression(
                                            [
                                                ts.factory.createPropertyAssignment(
                                                    ts.factory.createIdentifier(
                                                        "imports",
                                                    ),
                                                    ts.factory.createArrayLiteralExpression(
                                                        [],
                                                    ),
                                                ),
                                                ts.factory.createPropertyAssignment(
                                                    ts.factory.createIdentifier(
                                                        "controllers",
                                                    ),
                                                    ts.factory.createArrayLiteralExpression(
                                                        [
                                                            ts.factory.createIdentifier(
                                                                "AppController",
                                                            ),
                                                        ],
                                                    ),
                                                ),
                                            ],
                                        ),
                                    ],
                                    true,
                                ),
                            ),
                        ],
                        true,
                    ),
                ],
            ),
        ),
    );

    const resultFile = ts.createSourceFile(
        "bootstrap.ts",
        "",
        ts.ScriptTarget.Latest,
    );

    const printer = ts.createPrinter();

    const result = printer.printNode(
        ts.EmitHint.Unspecified,
        ts.factory.createSourceFile(
            [moduleOptionsExpr],
            ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
            ts.NodeFlags.BlockScoped,
        ),

        resultFile,
    );

    return result;
}

export function updateModuleOptions() {
    const bootstrapFilePath = path.resolve(
        __dirname,
        "../packages/example/bootstrap.ts",
    );

    const program = ts.createProgram([bootstrapFilePath], {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.CommonJS,
    });

    let sourceFile = program.getSourceFile(bootstrapFilePath);

    if (!sourceFile) {
        throw new Error("소스 파일을 찾을 수 없습니다.");
    }

    let binaryExpression: ts.BinaryExpression | undefined;

    const newStatements: ts.Statement[] = [];

    function visitor(node: ts.Node) {
        if (ts.isExpressionStatement(node)) {
            const expression = node.expression;
            const holder = node;

            if (ts.isBinaryExpression(expression)) {
                const left = expression.left;
                binaryExpression = expression;

                if (ts.isPropertyAccessExpression(left)) {
                    const expression = left.expression;

                    if (expression.kind === ts.SyntaxKind.ThisKeyword) {
                        const name = left.name as ts.Identifier;

                        if (name.escapedText === "moduleOptions") {
                            // TODO: parent를 거슬러 올라가면서 classDeclaration을 찾아야함

                            newStatements.push(
                                ts.factory.updateExpressionStatement(
                                    holder,
                                    updateBinaryExpression(binaryExpression),
                                ),
                            );
                        }
                    }
                }
            }
        } else if (ts.isClassDeclaration(node)) {
            newStatements.push(node);
        } else if (ts.isImportDeclaration(node)) {
            newStatements.push(node);
        }

        ts.forEachChild(node, visitor);
    }

    visitor(sourceFile);

    if (!binaryExpression) {
        throw new Error("ModuleOptions를 찾을 수 없습니다.");
    }

    sourceFile = ts.factory.updateSourceFile(sourceFile, [...newStatements]);

    const printer = ts.createPrinter();

    const result = printer.printNode(
        ts.EmitHint.Unspecified,
        sourceFile,
        sourceFile,
    );

    const bootstrapFilePath2 = path.resolve(
        __dirname,
        "../packages/example/bootstrap2.ts",
    );

    fs.writeFileSync(bootstrapFilePath2, result);

    return true;
}

export function updateBinaryExpression(binaryExpression: ts.BinaryExpression) {
    return ts.factory.updateBinaryExpression(
        binaryExpression,
        binaryExpression.left,
        binaryExpression.operatorToken,
        ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("ModuleOptions"),
                ts.factory.createIdentifier("merge"),
            ),
            undefined,
            [
                ts.factory.createObjectLiteralExpression(
                    [
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier("imports"),
                            ts.factory.createArrayLiteralExpression(
                                [
                                    ts.factory.createObjectLiteralExpression([
                                        ts.factory.createPropertyAssignment(
                                            ts.factory.createIdentifier(
                                                "imports",
                                            ),
                                            ts.factory.createArrayLiteralExpression(
                                                [],
                                            ),
                                        ),
                                        ts.factory.createPropertyAssignment(
                                            ts.factory.createIdentifier(
                                                "controllers",
                                            ),
                                            ts.factory.createArrayLiteralExpression(
                                                [
                                                    ts.factory.createIdentifier(
                                                        "PostController",
                                                    ),
                                                    ts.factory.createIdentifier(
                                                        "UserController",
                                                    ),
                                                ],
                                            ),
                                        ),
                                    ]),
                                ],
                                true,
                            ),
                        ),
                    ],
                    true,
                ),
            ],
        ),
    );
}

describe("타입스크립트 컴파일러 테스트", () => {
    it("컴파일러로부터 ModuleOptions 생성", () => {
        const result = createModuleOptions();

        console.log(result);

        expect(result).toMatch(
            [
                "this.moduleOptions = ModuleOptions.merge({",
                "    imports: [",
                "        { imports: [], controllers: [AppController] }",
                "    ]",
                "});",
            ].join("\n"),
        );
    });

    it("bootstrap.ts 파일을 읽고 ModuleOptions 변경 처리", () => {
        const result = updateModuleOptions();

        expect(result).toBeTruthy();
    });
});
