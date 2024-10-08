import { ControllerCodeFactory } from "./ControllerCodeFactory";
export declare class ServiceCodeFactory extends ControllerCodeFactory {
    /**
     * 코드 생성기를 생성합니다.
     *
     * @param routerName
     */
    protected createCodeGenerator(routerName: string): void;
    build(): boolean;
}
