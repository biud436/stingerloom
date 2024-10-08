export interface IndexOption {
    name?: string;
}
export interface IndexMetadata {
    target: any;
    name: string;
    type: any;
}
export declare const INDEX_TOKEN: unique symbol;
export declare function Index(): PropertyDecorator;
