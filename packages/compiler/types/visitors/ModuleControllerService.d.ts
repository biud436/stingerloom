import ts from "typescript";
/**
 * 컨트롤러 속성을 읽어옵니다.
 *
 * @param node
 * @returns
 */
declare function readWithDepth0(node: ts.CallExpression): ts.PropertyAssignment | undefined;
/**
 * 컨트롤러 속성을 업데이트합니다.
 *
 * @param node
 * @returns
 */
declare function addControllerNode(node: ts.PropertyAssignment, controllerName: string): ts.PropertyAssignment;
export declare const ModuleControllerService: {
    /**
     * 컨트롤러 속성을 읽어옵니다.
     *
     * @param node
     * @returns
     */
    read: typeof readWithDepth0;
    /**
     * 컨트롤러 속성을 새로 추가합니다.
     *
     * @param node
     * @returns
     */
    add: typeof addControllerNode;
};
export {};
