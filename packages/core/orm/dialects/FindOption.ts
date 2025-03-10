import { ISelectOption } from "./ISelectOption";
import { IOrderBy } from "./IOrderBy";

/**
 * Represents the options that can be used to find entities in the ORM.
 *
 * @template T - The type of the entity.
 */
export type FindOption<T> = {
  /**
   * Specifies the fields to select in the query.
   */
  select?: ISelectOption<T>;

  /**
   * Specifies the conditions to filter the entities.
   * Each key corresponds to a field in the entity, and the value is the value to match.
   */
  where?: {
    [K in keyof T]?: T[K];
  };

  /**
   * Specifies the limit for the number of entities to retrieve.
   * Can be a tuple representing the offset and limit, or a single number representing the limit.
   */
  limit?: [number, number] | number;

  /**
   * Specifies the number of entities to take.
   */
  take?: number;

  /**
   * Specifies the order in which to sort the entities.
   */
  orderBy?: IOrderBy<Partial<T>>;

  /**
   * Specifies the fields to group the entities by.
   */
  groupBy?: (keyof T)[];

  /**
   * Specifies the relations to include in the query.
   */
  relations?: (keyof T)[];
};
