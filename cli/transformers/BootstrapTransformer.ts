/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import * as ts from "typescript";
import path from "path";

/**
 * TODO: 다음 링크를 참고할 것
 *
 * https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/transform/src/transform.ts
 */
export function visitNode(
    sourceFile: ts.SourceFile,
    typeChecker: ts.TypeChecker,
) {
    visitor(sourceFile);

    function visitor(node: ts.Node) {
        if (ts.isClassDeclaration(node)) {
            console.log(`찾았습니다 ${node.name?.text}`);
        }

        if (ts.isMethodDeclaration(node)) {
            // ts.forEachChild(node, visitor);

            const name = node.name as ts.Identifier;

            if (name.escapedText === "beforeStart") {
                node.body?.statements.forEach((statement) => {
                    if (ts.isExpressionStatement(statement)) {
                        const expression = statement.expression;

                        console.log(expression.getText(sourceFile));
                    }
                });
            }
        }

        ts.forEachChild(node, visitor);
    }
}

export class BootstrapTransformer {
    constructor() {}

    async start() {
        const bootstrapFile = path.join(
            __dirname,
            "..",
            "..",
            "packages",
            "example",
            "bootstrap.ts",
        );

        const program = ts.createProgram([bootstrapFile], {});
        const sourceFile = program.getSourceFile(bootstrapFile);

        const typeChecker = program.getTypeChecker();

        visitNode(sourceFile!, typeChecker);
    }
}
