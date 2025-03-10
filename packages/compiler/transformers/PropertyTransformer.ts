/* eslint-disable @typescript-eslint/no-explicit-any */
import ts from "typescript";

const updateControllerOrProviderNode =
  (controllerOrProviderName: string) => (node: ts.PropertyAssignment) => {
    if (!ts.isPropertyAssignment(node)) {
      throw new Error("node는 PropertyAssignment 타입이어야 합니다.");
    }

    const initializer = node.initializer as ts.ArrayLiteralExpression;

    return ts.factory.updatePropertyAssignment(
      node,
      node.name,
      ts.factory.updateArrayLiteralExpression(initializer, [
        ...initializer.elements,
        ts.factory.createIdentifier(controllerOrProviderName),
      ]),
    );
  };

const controllerTransformer =
  (targetNode: ts.PropertyAssignment, controllerName: string) =>
  (context: ts.TransformationContext) => {
    return (soureFile: any) => {
      const visitor: ts.Visitor = (rootNode: ts.Node) => {
        if (ts.isPropertyAssignment(rootNode)) {
          const name = rootNode.name as ts.Identifier;

          if (name.escapedText === "controllers") {
            return updateControllerOrProviderNode(controllerName)(targetNode);
          }
        }

        return ts.visitEachChild(rootNode, visitor, context);
      };

      return ts.visitNode(soureFile, visitor);
    };
  };

const providerTransformer =
  (targetNode: ts.PropertyAssignment, providerName: string) =>
  (context: ts.TransformationContext) => {
    return (soureFile: any) => {
      const visitor: ts.Visitor = (rootNode: ts.Node) => {
        if (ts.isPropertyAssignment(rootNode)) {
          const name = rootNode.name as ts.Identifier;

          if (name.escapedText === "providers") {
            return updateControllerOrProviderNode(providerName)(targetNode);
          }
        }

        return ts.visitEachChild(rootNode, visitor, context);
      };

      return ts.visitNode(soureFile, visitor);
    };
  };

export const PropertyTransformer = {
  /**
   * controllers 속성을 변환합니다.
   */
  controllerTransformer,

  /**
   * providers 속성을 변환합니다.
   */
  providerTransformer,
};
