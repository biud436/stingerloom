import ts from "typescript";
import fs from "fs";
import path from "path";

const transformer = (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
        const visitor: ts.Visitor = (rootNode: ts.Node) => {
            if (ts.isExpressionStatement(rootNode)) {
                const expression = rootNode.expression;

                if (ts.isBinaryExpression(expression)) {
                    const left = expression.left;
                    const binaryExpression = expression;

                    if (ts.isPropertyAccessExpression(left)) {
                        const expression = left.expression;

                        if (expression.kind === ts.SyntaxKind.ThisKeyword) {
                            const name = left.name as ts.Identifier;

                            if (name.escapedText === "moduleOptions") {
                                return ts.factory.updateExpressionStatement(
                                    rootNode,
                                    updateBinaryExpression(binaryExpression),
                                );
                            }
                        }
                    }
                }
            }

            return ts.visitEachChild(rootNode, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor);
    };
};
/**
 * @see
 * https://kinda-silly-blog.vercel.app/posts/typescript-compiler-api
 *
 * @returns
 */

export function updateModuleOptions() {
    const bootstrapFilePath = path.resolve(
        __dirname,
        "../packages/example/bootstrap.ts",
    );

    const program = ts.createProgram([bootstrapFilePath], {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.CommonJS,
        allowJs: false,
    });

    const sourceFile = program.getSourceFile(bootstrapFilePath);

    if (!sourceFile) {
        throw new Error("소스 파일을 찾을 수 없습니다.");
    }

    const printer = ts.createPrinter();

    const transformationResult = ts.transform(
        sourceFile,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [transformer as any],
        program.getCompilerOptions(),
    );

    const result = printer.printNode(
        ts.EmitHint.Unspecified,
        transformationResult.transformed[0],
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
                                        ts.factory.createPropertyAssignment(
                                            ts.factory.createIdentifier(
                                                "providers",
                                            ),
                                            ts.factory.createArrayLiteralExpression(
                                                [],
                                            ),
                                        ),
                                    ]),
                                ],
                                true,
                            ),
                        ),
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier("controllers"),
                            ts.factory.createArrayLiteralExpression([]),
                        ),
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier("providers"),
                            ts.factory.createArrayLiteralExpression([]),
                        ),
                        ts.factory.createPropertyAssignment(
                            ts.factory.createIdentifier("configuration"),
                            ts.factory.createIdentifier("databaseOption"),
                        ),
                    ],
                    true,
                ),
            ],
        ),
    );
}

describe("타입스크립트 컴파일러 테스트", () => {
    it("bootstrap.ts 파일을 읽고 ModuleOptions 변경 처리", () => {
        const result = updateModuleOptions();

        expect(result).toBeTruthy();
    });
});
