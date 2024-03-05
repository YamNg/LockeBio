import { NodeCacheRepository } from "./node-cache.repository.js";
import database from "../config/database/node-cache-database.js";
import { OrderEntity } from "../models/entity/order.entity.js";
import { randomUUID } from "crypto";
import {
  DbOperationFailure,
  EntityAlreadyExists,
  EntityNotFound,
} from "../constants/app-error.constant.js";

jest.mock("../config/database/node-cache-database.js");

const mockNameSpace = "mockNameSpace";
const mockId = "mockId";
const mockId2 = "mockId2";
let mockNodeCacheRepository = new NodeCacheRepository<OrderEntity>(
  mockNameSpace
);
let mockDatabase = jest.mocked(database);

describe("get", () => {
  it("return result from database", () => {
    mockDatabase.get = jest.fn().mockReturnValue(orderEntity);
    const result = mockNodeCacheRepository.get(mockId);

    // get record by using specific key constructed by namespace and id from database
    expect(mockDatabase.get).toHaveBeenCalledWith(`${mockNameSpace}-${mockId}`);
    expect(result).toEqual(orderEntity);
  });
});

describe("getAll", () => {
  it("should handle empty database", () => {
    // in case there is no record in database
    mockDatabase.keys = jest.fn().mockReturnValueOnce([]);
    mockDatabase.get = jest.fn();

    const result = mockNodeCacheRepository.getAll();
    expect(mockDatabase.get).toHaveBeenCalledTimes(0);
    expect(result).toEqual([]);
  });

  it("return all result from database which was not soft deleted", () => {
    mockDatabase.keys = jest.fn().mockReturnValueOnce(databaseRecordKeys);
    mockDatabase.get = jest
      .fn()
      .mockReturnValueOnce(orderEntity)
      .mockReturnValueOnce(deletedOrderEntity);

    const result = mockNodeCacheRepository.getAll();

    expect(mockDatabase.get).toHaveBeenCalledTimes(2);
    expect(mockDatabase.get).toHaveBeenCalledWith(`${mockNameSpace}-${mockId}`);
    expect(mockDatabase.get).toHaveBeenCalledWith(
      `${mockNameSpace}-${mockId2}`
    );
    // record which is soft deleted should be filtered out, i.e. only 1 record remains in the result
    expect(result).toEqual([orderEntity]);
  });

  it("return all result from database with specific namespace", () => {
    // as node-cache will store all record under same place, when querying for a specific type of object
    // logic need to be implemented to filter out other namespace records

    // databaseRecordKeys with records which belongs to another namespace
    mockDatabase.keys = jest.fn().mockReturnValueOnce(databaseRecordKeys);
    mockDatabase.get = jest
      .fn()
      .mockReturnValueOnce(orderEntity)
      .mockReturnValueOnce(orderEntity2);

    const result = mockNodeCacheRepository.getAll();

    // only 2 of the keys are related to mockNameSpace
    expect(mockDatabase.get).toHaveBeenCalledTimes(2);
    expect(mockDatabase.get).toHaveBeenCalledWith(`${mockNameSpace}-${mockId}`);
    expect(mockDatabase.get).toHaveBeenCalledWith(
      `${mockNameSpace}-${mockId2}`
    );
    expect(result).toEqual([orderEntity, orderEntity2]);
  });
});

describe("insert", () => {
  it("throw error if entity id already exists", () => {
    // in case database have found existing record with same key
    mockDatabase.has = jest.fn().mockReturnValueOnce(true);
    mockDatabase.set = jest.fn();

    try {
      const result = mockNodeCacheRepository.insert(orderEntityToBeInserted);
    } catch (error) {
      expect(error).toMatchObject(EntityAlreadyExists);
    }

    expect(mockDatabase.set).toHaveBeenCalledTimes(0);
  });

  it("throw error if save operation failed", () => {
    // in case database failed to save record
    mockDatabase.has = jest.fn().mockReturnValueOnce(false);
    mockDatabase.set = jest.fn().mockReturnValueOnce(false);

    try {
      const result = mockNodeCacheRepository.insert(orderEntityToBeInserted);
    } catch (error) {
      expect(error).toMatchObject(DbOperationFailure);
    }
  });

  it("should auto generate id if not specified, save to database and return result", () => {
    mockDatabase.has = jest.fn().mockReturnValueOnce(false);
    mockDatabase.set = jest.fn().mockReturnValueOnce(true);

    const result = mockNodeCacheRepository.insert(orderEntityToBeInserted);
    expect(result).toEqual(
      expect.objectContaining({
        ...orderEntityToBeInserted,
        // should included an auto generated id when saving, if it was not specified
        id: expect.any(String),
        // date metadata should also generated
        createAt: expect.any(Date),
        updateAt: expect.any(Date),
      })
    );
  });

  it("should use id set in entity, save to database and return result", () => {
    mockDatabase.has = jest.fn().mockReturnValueOnce(false);
    mockDatabase.set = jest.fn().mockReturnValueOnce(true);
    let targetOrderEntityToBeInserted = structuredClone(
      orderEntityToBeInserted
    );
    targetOrderEntityToBeInserted.id = "testingId";

    const result = mockNodeCacheRepository.insert(
      targetOrderEntityToBeInserted
    );
    expect(result).toEqual(
      expect.objectContaining({
        ...orderEntityToBeInserted,
        // should use original id in entity
        id: "testingId",
        // date metadata should also generated
        createAt: expect.any(Date),
        updateAt: expect.any(Date),
      })
    );
  });
});

describe("update", () => {
  it("throw error if save operation failed", () => {
    // in case database failed to save record
    mockDatabase.set = jest.fn().mockReturnValueOnce(false);
    try {
      const result = mockNodeCacheRepository.update(
        structuredClone(orderEntity)
      );
    } catch (error) {
      expect(error).toMatchObject(DbOperationFailure);
    }
  });

  it("should update updateAt timestamp in entity, save to database and return result", () => {
    mockDatabase.set = jest.fn().mockReturnValueOnce(true);
    const result = mockNodeCacheRepository.update(structuredClone(orderEntity));

    // metadata updateAt should be updated
    expect(result.updateAt).not.toBeNull;
    if (result.updateAt && orderEntity.updateAt) {
      expect(result.updateAt.getTime()).toBeGreaterThan(
        orderEntity.updateAt.getTime()
      );
    }
    expect(mockDatabase.set).toHaveBeenCalledWith(
      `${mockNameSpace}-${orderEntity.id}`,
      expect.objectContaining({
        ...orderEntity,
        updateAt: expect.any(Date),
      })
    );
  });
});

describe("delete", () => {
  it("thrown an error if entity is already soft deleted", () => {
    // in case record already been deleted
    mockDatabase.get = jest.fn().mockReturnValueOnce(deletedOrderEntity);
    try {
      const result = mockNodeCacheRepository.delete("testId");
    } catch (error) {
      expect(error).toMatchObject(EntityNotFound);
    }
  });

  it("thrown an error if entity cannot be found", () => {
    // in case record was not found
    mockDatabase.get = jest.fn().mockReturnValueOnce(undefined);
    try {
      const result = mockNodeCacheRepository.delete("testId");
    } catch (error) {
      expect(error).toMatchObject(EntityNotFound);
    }
  });

  it("thrown an error if save operation failed", () => {
    // in case database failed to save record
    mockDatabase.get = jest
      .fn()
      .mockReturnValueOnce(structuredClone(orderEntity));
    mockDatabase.set = jest.fn().mockReturnValueOnce(false);
    try {
      const result = mockNodeCacheRepository.delete("testId");
    } catch (error) {
      expect(error).toMatchObject(DbOperationFailure);
    }
  });

  it("set isActive to false as well as updateAt to current time, and saved to database ", () => {
    mockDatabase.get = jest
      .fn()
      .mockReturnValueOnce(structuredClone(orderEntity));
    mockDatabase.set = jest.fn().mockReturnValueOnce(true);

    const result = mockNodeCacheRepository.delete("testId");
    expect(mockDatabase.set).toHaveBeenCalledWith(
      `${mockNameSpace}-testId`,
      expect.objectContaining({
        ...orderEntity,
        // isActive should set to false for soft delete
        isActive: false,
        updateAt: expect.any(Date),
      })
    );
  });
});

const databaseRecordKeys = [
  `${mockNameSpace}-${mockId}`,
  `${mockNameSpace}-${mockId2}`,
  "mockNameSpace2-mockId",
  "mockNameSpace3-mockId",
];

const orderEntity: OrderEntity = {
  id: randomUUID().replace(/-/g, ""),
  createAt: new Date("2024-01-01"),
  updateAt: new Date("2024-01-01"),
  isActive: true,
  pharmacy: {
    id: "careplus",
    integrationName: "careplus",
    name: "CarePlus Pharmacy",
    address: "456 Elm St",
    city: "Townsville",
    state: "Stateville",
    zipcode: "67890",
    country: "Countryland",
    fax: "567-890-1234",
    phone: "876-543-2109",
  },
  status: "sent",
  product: {
    id: randomUUID().replace(/-/g, ""),
    label: "Antibiotics",
    integrationName: "Antibiotics",
  },
  quantity: 10,
  customer: {
    fullName: "Tester01",
    address: "Testing Address.",
    city: "Toronto",
    state: "ON",
    zipCode: "A0A0A0",
    country: "Canada",
  },
};

const orderEntity2: OrderEntity = {
  id: randomUUID().replace(/-/g, ""),
  createAt: new Date(),
  updateAt: new Date(),
  isActive: true,
  pharmacy: {
    id: "healthMart",
    integrationName: "healthmart",
    name: "HealthMart Pharmacy",
    address: "123 Main St",
    city: "Cityville",
    state: "Stateville",
    zipcode: "12345",
    country: "Countryland",
    fax: "123-456-7890",
    phone: "987-654-3210",
  },
  status: "sent",
  product: {
    id: randomUUID().replace(/-/g, ""),
    label: "Painkiller",
    integrationName: "Painkiller",
  },
  quantity: 10,
  customer: {
    fullName: "Tester01",
    address: "Testing Address.",
    city: "Toronto",
    state: "ON",
    zipCode: "A0A0A0",
    country: "Canada",
  },
};

const deletedOrderEntity: OrderEntity = {
  id: randomUUID().replace(/-/g, ""),
  createAt: new Date(),
  updateAt: new Date(),
  isActive: false,
  pharmacy: {
    id: "healthMart",
    integrationName: "healthmart",
    name: "HealthMart Pharmacy",
    address: "123 Main St",
    city: "Cityville",
    state: "Stateville",
    zipcode: "12345",
    country: "Countryland",
    fax: "123-456-7890",
    phone: "987-654-3210",
  },
  status: "sent",
  product: {
    id: randomUUID().replace(/-/g, ""),
    label: "Painkiller",
    integrationName: "Painkiller",
  },
  quantity: 10,
  customer: {
    fullName: "Tester01",
    address: "Testing Address.",
    city: "Toronto",
    state: "ON",
    zipCode: "A0A0A0",
    country: "Canada",
  },
};

const orderEntityToBeInserted: OrderEntity = {
  isActive: true,
  pharmacy: {
    id: "healthMart",
    integrationName: "healthmart",
    name: "HealthMart Pharmacy",
    address: "123 Main St",
    city: "Cityville",
    state: "Stateville",
    zipcode: "12345",
    country: "Countryland",
    fax: "123-456-7890",
    phone: "987-654-3210",
  },
  status: "sent",
  product: {
    id: randomUUID().replace(/-/g, ""),
    label: "Painkiller",
    integrationName: "Painkiller",
  },
  quantity: 10,
  customer: {
    fullName: "Tester01",
    address: "Testing Address.",
    city: "Toronto",
    state: "ON",
    zipCode: "A0A0A0",
    country: "Canada",
  },
};
