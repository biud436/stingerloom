/* eslint-disable @typescript-eslint/no-explicit-any */
import ts from "typescript";

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
});
