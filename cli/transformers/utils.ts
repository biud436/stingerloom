import ts from "typescript";

export function createController(identiferName: string) {
    return ts.factory.createPropertyAssignment(
        ts.factory.createIdentifier("controllers"),
        ts.factory.createArrayLiteralExpression([
            ts.factory.createIdentifier(identiferName),
        ]),
    );
}
