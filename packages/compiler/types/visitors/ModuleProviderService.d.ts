import ts from "typescript";
/**
 * Provider 속성을 읽어옵니다.
 *
 * @param node
 * @returns
 */
declare function readWithDepth0(node: ts.CallExpression): ts.PropertyAssignment | undefined;
/**
 * Provider 속성을 업데이트합니다.
 *
 * @param node
 * @returns
 */
declare function addProviderNode(node: ts.PropertyAssignment, controllerName: string): ts.PropertyAssignment;
export declare const ModuleProviderService: {
    /**
     * 프로바이더 속성을 읽어옵니다.
     *
     * @param node
     * @returns
     */
    read: typeof readWithDepth0;
    /**
     * 프로바이더 속성을 새로 추가합니다.
     *
     * @param node
     * @returns
     */
    add: typeof addProviderNode;
};
export {};
