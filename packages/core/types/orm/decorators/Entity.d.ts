export interface EntityOption {
    name?: string;
}
export declare const ENTITY_TOKEN: unique symbol;
export declare function Entity(options?: EntityOption): ClassDecorator;
