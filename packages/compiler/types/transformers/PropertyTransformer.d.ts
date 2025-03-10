/* eslint-disable @typescript-eslint/no-explicit-any */
import ts from "typescript";
export declare const PropertyTransformer: {
  /**
   * controllers 속성을 변환합니다.
   */
  controllerTransformer: (
    targetNode: ts.PropertyAssignment,
    controllerName: string,
  ) => (context: ts.TransformationContext) => (soureFile: any) => any;
  /**
   * providers 속성을 변환합니다.
   */
  providerTransformer: (
    targetNode: ts.PropertyAssignment,
    providerName: string,
  ) => (context: ts.TransformationContext) => (soureFile: any) => any;
};
