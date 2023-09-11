import ts from "typescript";
import { isTsPropertyName } from "../utils";

/**
 * 컨트롤러 속성을 읽어옵니다.
 *
 * @param node
 * @returns
 */
function readWithDepth0(
    node: ts.CallExpression,
): ts.PropertyAssignment | undefined {
    let controllerNode: ts.PropertyAssignment | undefined = undefined;

    const visitor = (node: ts.Node) => {
        if (ts.isPropertyAssignment(node)) {
            if (isTsPropertyName(node, "controllers")) {
                controllerNode = node;
            }
        }

        ts.forEachChild(node, visitor);
    };

    visitor(node);

    return controllerNode;
}

/**
 * 컨트롤러 속성을 업데이트합니다.
 *
 * @param node
 * @returns
 */
function addControllerNode(
    node: ts.PropertyAssignment,
    controllerName: string,
) {
    if (!ts.isPropertyAssignment(node)) {
        throw new Error("node는 PropertyAssignment 타입이어야 합니다.");
    }

    const initializer = node.initializer as ts.ArrayLiteralExpression;

    return ts.factory.updatePropertyAssignment(
        node,
        node.name,
        ts.factory.updateArrayLiteralExpression(initializer, [
            ...initializer.elements,
            ts.factory.createIdentifier(controllerName),
        ]),
    );
}

export const ModuleControllerService = {
    /**
     * 컨트롤러 속성을 읽어옵니다.
     *
     * @param node
     * @returns
     */
    read: readWithDepth0,

    /**
     * 컨트롤러 속성을 새로 추가합니다.
     *
     * @param node
     * @returns
     */
    add: addControllerNode,
};
