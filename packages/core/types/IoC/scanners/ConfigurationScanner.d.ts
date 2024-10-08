import { MetadataScanner } from "./MetadataScanner";
/**
 * 이 타입은 함수 타입 T의 반환 타입을 동적으로 가져오는 역할을 합니다.
 * 함수 타입 T가 받아들이는 인수에 따라 반환 타입이 달라질 수 있습니다.
 * T가 함수 타입이 아닌 경우에는 unknown 타입을 반환합니다.
 */
export type DynamicReturnType<T extends (...args: unknown[]) => unknown> = T extends (...args: unknown[]) => infer R ? R : unknown;
export type ConfigurationMetadata<T extends (...args: unknown[]) => unknown = any> = {
    path: string;
    target: unknown;
    methods: DynamicReturnType<T>[];
};
export declare class ConfigurationScanner extends MetadataScanner {
    makeConfigurations(): IterableIterator<ConfigurationMetadata>;
}
