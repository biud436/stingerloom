import { ColumnMetadata } from "../scanner";

export type SchemaOptions = Omit<ColumnMetadata, "target" | "type">;
