import ts from "typescript";

/**
 * Provider 속성을 읽어옵니다.
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
      const name = node.name as ts.Identifier;

      if (name.escapedText === "providers") {
        controllerNode = node;
      }
    }

    ts.forEachChild(node, visitor);
  };

  visitor(node);

  return controllerNode;
}

/**
 * Provider 속성을 업데이트합니다.
 *
 * @param node
 * @returns
 */
function addProviderNode(node: ts.PropertyAssignment, controllerName: string) {
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

export const ModuleProviderService = {
  /**
   * 프로바이더 속성을 읽어옵니다.
   *
   * @param node
   * @returns
   */
  read: readWithDepth0,

  /**
   * 프로바이더 속성을 새로 추가합니다.
   *
   * @param node
   * @returns
   */
  add: addProviderNode,
};
