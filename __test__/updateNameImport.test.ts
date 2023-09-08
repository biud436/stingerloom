import ts from "typescript";
import path from "path";
import fs from "fs";

/**
 * 새로운 import 구문을 추가합니다.
 *
 * @param namedImportIdentifier
 * @param importPath
 * @returns
 */
const transformer =
    (namedImportIdentifier: string, importPath: string) =>
    (context: ts.TransformationContext) => {
        return (sourceFile: ts.SourceFile) => {
            const { factory } = context;

            const imports = sourceFile.statements.filter(
                ts.isImportDeclaration,
            );

            const lastImports = imports.at(-1);

            const lastIndex = lastImports
                ? sourceFile.statements.indexOf(lastImports)
                : 0;

            return ts.factory.updateSourceFile(sourceFile, [
                ...sourceFile.statements.slice(0, lastIndex),
                factory.createImportDeclaration(
                    undefined,
                    ts.factory.createImportClause(
                        false,
                        undefined,
                        ts.factory.createNamedImports([
                            ts.factory.createImportSpecifier(
                                false,
                                undefined,
                                ts.factory.createIdentifier(
                                    namedImportIdentifier,
                                ),
                            ),
                        ]),
                    ),
                    ts.factory.createStringLiteral(importPath),
                ),
                ...sourceFile.statements.slice(lastIndex + 1),
            ]);
        };
    };

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
        [transformer("TestController", "./controllers/app/TestController")],
        program.getCompilerOptions(),
    );

    const result = printer.printNode(
        ts.EmitHint.Unspecified,
        transformationResult.transformed[0],
        sourceFile,
    );

    const bootstrapFilePath2 = path.resolve(
        __dirname,
        "../packages/example/bootstrap3.ts",
    );

    fs.writeFileSync(bootstrapFilePath2, result);

    return true;
}

describe("타입스크립트 컴파일러 테스트", () => {
    it("TestController를 import 문에 추가한다", () => {
        const result = updateModuleOptions();

        expect(result).toBe(true);
    });
});
