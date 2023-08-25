import * as ts from "typescript";

/**
 * === 출력 내용 ===
 * import("InstanceWrapper");
 * console.log(res);
 */
export function doTest() {
    const print = ts.factory.createExpressionStatement(
        ts.factory.createCallExpression(
            ts.factory.createIdentifier("console.log"),
            undefined,
            [ts.factory.createIdentifier("res")],
        ),
    );

    const importExpr = ts.factory.createExpressionStatement(
        ts.factory.createCallExpression(
            ts.factory.createToken(
                ts.SyntaxKind.ImportKeyword,
            ) as ts.Expression,
            undefined,
            [ts.factory.createStringLiteral("InstanceWrapper")],
        ),
    );

    const resultFile = ts.createSourceFile(
        "factorial.ts",
        "",
        ts.ScriptTarget.Latest,
    );
    const printer = ts.createPrinter();

    const result = printer.printNode(
        ts.EmitHint.Unspecified,
        ts.factory.createSourceFile(
            [importExpr, print],
            ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
            ts.NodeFlags.BlockScoped,
        ),
        resultFile,
    );

    console.log(result);
}
