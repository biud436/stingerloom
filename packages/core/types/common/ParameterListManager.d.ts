import { DynamicClassWrapper } from "@stingerloom/core/IoC/scanners/MetadataScanner";
export type ParameterAllocator = (param: any, parameters: DynamicClassWrapper<any>[]) => void;
/**
 * @class ParameterListManager
 * @description
 * 컨트롤러나 서비스 클래스의 생성자 매개변수가 어떻게 변환되어야 하는지를 통괄 관리하는 클래스입니다.
 * 예를 들면, 리포지토리 같은 경우에는 자동으로 매개변수에 리포지토리가 주입되어야 합니다.
 * 매개변수에 주입되기 전에 변환 또는 할당 작업이 필요한 경우가 있습니다.
 *
 * 이 클래스는 이러한 매개변수 할당 함수(할당기)를 관리하는 클래스입니다.
 */
export declare class ParameterListManager {
    private commandList;
    private static instance;
    static DEFAULT: string;
    private isReady;
    private constructor();
    private addCommand;
    private getCommand;
    static getInstance(): ParameterListManager;
    /**
     * Parameter Allocator를 취득합니다.
     *
     * @param name
     * @returns
     */
    static invoke(name: string): ParameterAllocator | undefined;
    /**
     * 매개변수 할당기를 커맨드로 등록합니다.
     */
    static initAllocator(): void;
}
