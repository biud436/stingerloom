import * as ts from "typescript";

export function createImportStatement() {
    const importStatement = ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
            false,
            undefined,
            ts.factory.createNamedImports([
                ts.factory.createImportSpecifier(
                    false,
                    undefined,
                    ts.factory.createIdentifier("AppController"),
                ),
            ]),
        ),
        ts.factory.createStringLiteral("./controllers/app/AppController"),
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
            [importStatement],
            ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
            ts.NodeFlags.BlockScoped,
        ),

        resultFile,
    );

    return result;
}

describe("타입스크립트 컴파일러 테스트", () => {
    it("import 구문 생성", () => {
        const result = createImportStatement();

        console.log(result);

        expect(result).toMatch(
            `import { AppController } from "./controllers/app/AppController";`,
        );
    });
});
