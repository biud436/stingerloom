import { ClassCodeGenerator } from "./ClassCodeGenerator";
export declare class InjectableCodeGenerator extends ClassCodeGenerator {
    /**
     * 타입스크립트 AST를 생성합니다.
     */
    generateServiceFile(): void;
    /**
     * 파일명을 파스칼 케이스로 가져옵니다.
     *
     * @returns
     */
    protected getFilename(): string;
}
