export class EntityNotFound extends Error {
  constructor(entityName: string) {
    super(`Entity "${entityName}" not found.`);
  }
}
