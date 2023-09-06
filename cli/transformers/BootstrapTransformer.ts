/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import * as ts from "typescript";
import path from "path";

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
