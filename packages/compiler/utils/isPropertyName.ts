import ts from "typescript";

export function isTsPropertyName(node: ts.PropertyAssignment, name: string) {
  const identifier = node.name as ts.Identifier;

  return identifier.escapedText === name;
}
