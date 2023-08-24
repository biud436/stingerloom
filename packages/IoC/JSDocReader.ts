/* eslint-disable @typescript-eslint/no-explicit-any */
import path from "path";
import ts from "typescript";
import fs from "fs";

export class JSDocReader {
    /**
     * jsDoc을 읽어옵니다.
     */
    public async read() {
        const targetPath = path.join(__dirname, "example", "controllers");

        const files = fs.readdirSync(targetPath);

        const program = ts.createProgram(
            files.map((file) => path.join(targetPath, file)),
            {},
        );

        const sourceFile = program.getSourceFile(
            "./src/example/controllers/PostController.ts",
        );

        ts.forEachChild(sourceFile!, (node) => {
            if (ts.isClassDeclaration(node)) {
                const name = node.name?.escapedText;

                if (name === "PostController") {
                    ts.forEachChild(node, (node) => {
                        if (ts.isMethodDeclaration(node)) {
                            console.log((node as any).jsDoc[0].comment);

                            node.getChildren(sourceFile).forEach((child) => {
                                if (child.kind === ts.SyntaxKind.JSDoc) {
                                    console.log(child.getText(sourceFile));
                                }
                            });
                        }
                    });
                }
            }
        });

        function visitNode(node: ts.Node) {
            switch (node.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                    {
                        const classDeclaration = node as ts.ClassDeclaration;
                        const className =
                            classDeclaration.name?.getText(sourceFile);
                        console.log(className);
                    }
                    break;
                case ts.SyntaxKind.MethodDeclaration:
                    {
                        const methodDeclaration = node as ts.MethodDeclaration;
                        const methodName =
                            methodDeclaration.name?.getText(sourceFile);
                        console.log(methodName);
                    }
                    break;
                case ts.SyntaxKind.Decorator:
                    {
                        const decorator = node as ts.Decorator;
                        const decoratorName =
                            decorator.expression.getText(sourceFile);
                        console.log(decoratorName);
                    }
                    break;
            }

            ts.forEachChild(node, visitNode);
        }

        visitNode(sourceFile!);
    }
}
