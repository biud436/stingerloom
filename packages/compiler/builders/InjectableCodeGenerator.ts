import ts from "typescript";
import { ClassCodeGenerator } from "./ClassCodeGenerator";

export class InjectableCodeGenerator extends ClassCodeGenerator {
    /**
     * 타입스크립트 AST를 생성합니다.
     */
    public generateServiceFile() {
        const importDelcarations = this.addImports(this.imported);

        const classDeclaration = ts.factory.createClassDeclaration(
            this.addClassModifier(),
            ts.factory.createIdentifier(this.getFilename()),
            undefined,
            undefined,
            [
                this.appendEmptyLine(),
                ts.factory.createMethodDeclaration(
                    [
                        ts.factory.createToken(ts.SyntaxKind.PublicKeyword),
                        ts.factory.createToken(ts.SyntaxKind.AsyncKeyword),
                    ],
                    undefined,
                    ts.factory.createIdentifier(
                        `get${this.toPascalCase(this.routerName)}`,
                    ),
                    undefined,
                    undefined,
                    [],
                    undefined,
                    ts.factory.createBlock(
                        [
                            ts.factory.createReturnStatement(
                                ts.factory.createStringLiteral("Hello World!"),
                            ),
                        ],
                        true,
                    ),
                ),
                this.appendEmptyLine(),
            ],
        );

        this.statements.push(...importDelcarations);
        this.statements.push(this.appendEmptyLine());
        this.statements.push(classDeclaration);

        this.generateFile();
    }

    /**
     * 파일명을 파스칼 케이스로 가져옵니다.
     *
     * @returns
     */
    protected getFilename(): string {
        return `${this.toPascalCase(this.routerName)}Service`;
    }
}
