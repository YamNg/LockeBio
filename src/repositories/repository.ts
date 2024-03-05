import { Entity } from "../models/entity/entity.interface.js";

// Interface class for Repository, in case for implementation of datasource other than node-cache
export interface Repository<T extends Entity> {
  get(key: string): T | undefined;
  getAll(): T[];
  insert(value: T): T;
  update(value: T): T;
}
