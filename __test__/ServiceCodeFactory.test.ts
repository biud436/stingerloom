import { ServiceCodeFactory } from "../packages/compiler/builders/ServiceCodeFactory";

describe("서비스 파일 생성기 테스트", () => {
    it("서비스 파일 생성", () => {
        const codeGenerator = new ServiceCodeFactory("test");

        expect(codeGenerator.build()).toBeTruthy();
    });
});
