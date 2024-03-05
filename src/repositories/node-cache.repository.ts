import database from "../config/database/node-cache-database.js";
import { randomUUID } from "crypto";
import { Repository } from "./repository.js";
import { Entity } from "../models/entity/entity.interface.js";
import { AppError } from "../models/error/app-error.js";
import {
  DbOperationFailure,
  EntityAlreadyExists,
  EntityNotFound,
} from "../constants/app-error.constant.js";
import { OrderEntity } from "../models/entity/order.entity.js";
import { databaseNamespace } from "../constants/database-namespace.constant.js";
import { PharmacyEntity } from "../models/entity/pharmacy.entity.js";

// Repository Implementation holding common operation for database
export class NodeCacheRepository<T extends Entity> implements Repository<T> {
  private namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  get(id: string): T | undefined {
    // get data by key combination of <namespace>-<id>
    const result = database.get<T>(`${this.namespace}-${id}`);
    return result;
  }

  getAll(): T[] {
    // as node-cache library don't have namespace separation
    // getAll function for a specific type of data simply done by loop all keys in database
    // and filtered related data by prefix of namespace
    const keys = database.keys();
    const values: T[] = [];
    for (const key of keys) {
      if (key.startsWith(`${this.namespace}-`)) {
        const value = database.get<T>(key);
        if (value !== undefined && value.isActive) {
          values.push(value);
        }
      }
    }
    return values;
  }

  insert(value: T): T {
    // auto generate id if it was not present in the parameter object passed
    let key = `${this.namespace}-`;
    if (value.id) {
      key = key + value.id;
    } else {
      const generatedId = randomUUID().replace(/-/g, "");
      key = key + generatedId;
      value.id = generatedId;
    }

    // update metadata timestamps
    const currDate = new Date();
    value.createAt = currDate;
    value.updateAt = currDate;

    // if key was present in cache, then throw error
    if (database.has(key)) throw new AppError(EntityAlreadyExists);

    // check for the flag after setting key-value to cache, in case it return false
    // record was not saved
    const isInserted = database.set(key, value);
    if (!isInserted) throw new AppError(DbOperationFailure);

    // return entity
    return value;
  }

  update(value: T): T {
    let key = `${this.namespace}-${value.id}`;
    // update metadata
    value.updateAt = new Date();
    // override original object
    const isUpdated = database.set(key, value);
    if (!isUpdated) throw new AppError(DbOperationFailure);

    return value;
  }

  delete(id: string): void {
    let key = `${this.namespace}-${id}`;
    // find related entity
    let value = database.get<T>(key);
    if (!value || !value.isActive) throw new AppError(EntityNotFound);

    // soft delete and set metadata
    value.isActive = false;
    value.updateAt = new Date();

    const isUpdated = database.set(key, value);
    if (!isUpdated) throw new AppError(DbOperationFailure);
  }
}

export const orderRepository = new NodeCacheRepository<OrderEntity>(
  databaseNamespace.ORDER_NAMESPACE
);

export const pharmacyRepository = new NodeCacheRepository<PharmacyEntity>(
  databaseNamespace.PHARMACY_NAMESPACE
);
