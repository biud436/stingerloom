/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-case-declarations */
import * as ts from "typescript";
import path from "path";

/**
 * TODO: 다음 링크를 참고할 것
 *
 * https://github.com/angular/angular/blob/main/packages/compiler-cli/src/ngtsc/transform/src/transform.ts
 * https://youtu.be/X8k_4tZ16qU
 * https://www.huy.rocks/everyday/04-01-2022-typescript-how-the-compiler-compiles
 */
export function visitNode(
    sourceFile: ts.SourceFile,
    typeChecker: ts.TypeChecker,
) {
    let isFoundModuleOption = false;
    let isFoundImports = false;

    visitor(sourceFile);

    function visitor(node: ts.Node) {
        if (ts.isClassDeclaration(node)) {
            console.log(`찾았습니다 ${node.name?.text}`);
        }

        if (ts.isMethodDeclaration(node)) {
            const name = node.name as ts.Identifier;

            if (name.escapedText === "beforeStart") {
                node.body?.statements.forEach((stmt) => {
                    if (ts.isExpressionStatement(stmt)) {
                        const expression = stmt.expression;

                        console.log(expression.getText(sourceFile));
                    }
                });
            }
        }

        if (ts.isIdentifier(node)) {
            const identifier = node as ts.Identifier;

            if (identifier.escapedText === "ModuleOptions") {
                isFoundModuleOption = true;
                console.log("ModuleOptions을 찾았습니다");
            }

            if (isFoundModuleOption) {
                if (identifier.escapedText === "imports") {
                    isFoundImports = true;
                    console.log("imports를 찾았습니다");
                }
            }

            if (isFoundImports) {
                const imports = node.parent?.parent;

                imports.forEachChild((child) => {
                    if (child.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                        const arrayLiteralExpression =
                            child as ts.ArrayLiteralExpression;

                        arrayLiteralExpression.elements.forEach((element) => {
                            const name = element as ts.Identifier;

                            console.log(name.escapedText);
                        });
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
