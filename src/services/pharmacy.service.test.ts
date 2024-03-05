import Joi from "joi";
import {
  PharmacyProductRequestPayload,
  PharmacyRequestPayload,
  PharmacyUpdateRequestPayload,
} from "../models/payload/request/pharmacy-request-payloads.interface.js";
import { pharmacyRepository } from "../repositories/node-cache.repository.js";
import { pharmacyService } from "./pharmacy.service.js";
import { PharmacyEntity } from "../models/entity/pharmacy.entity.js";
import {
  PharmacyNotFound,
  PharmacyProductNotFound,
} from "../constants/app-error.constant.js";
import { randomUUID } from "crypto";
import { PharmacyDto } from "../models/dto/pharmacy.dto.js";

jest.mock("../repositories/node-cache.repository.js");

let mockPharmacyRepo = jest.mocked(pharmacyRepository);

afterEach(() => {
  jest.clearAllMocks();
});

describe("PharmacyService", () => {
  describe("addPharmacy", () => {
    // in case the request payload is malformatted
    describe("with invalid request payload", () => {
      it('throws an error if invalid pharmacy "integrationName" property', () => {
        const targetPayload = structuredClone(pharmacyRequestPayload);
        targetPayload.integrationName = "";

        try {
          pharmacyService.addPharmacy(targetPayload);
        } catch (error) {
          expect(error).toBeInstanceOf(Joi.ValidationError);
        }
      });
    });

    it("return pharmacy dto after save", () => {
      mockPharmacyRepo.insert = jest.fn().mockReturnValue(pharmacyEntity);
      const result = pharmacyService.addPharmacy(pharmacyRequestPayload);
      expect(result).toEqual(pharmacyDto);
    });
  });

  describe("retrievePharmacies", () => {
    it("should handle empty array returned by database", () => {
      // in case there was no data related to pharmacy
      mockPharmacyRepo.getAll = jest.fn().mockReturnValue([]);
      const result = pharmacyService.retrievePharmacies();
      expect(result).toEqual([]);
    });

    it("return pharmacy dto array", () => {
      mockPharmacyRepo.getAll = jest.fn().mockReturnValue([pharmacyEntity]);
      const result = pharmacyService.retrievePharmacies();
      expect(result).toEqual([pharmacyDto]);
    });
  });

  describe("retrieveOrderById", () => {
    it("throws an error if pharmacy was not found", async () => {
      // in case order pharmacy be found
      mockPharmacyRepo.get = jest.fn().mockReturnValue(undefined);
      try {
        const result = pharmacyService.retrievePharmacyById("testPharmacy");
      } catch (error) {
        expect(error).toMatchObject(PharmacyNotFound);
      }
    });

    it("return pharmacy dto", () => {
      mockPharmacyRepo.get = jest.fn().mockReturnValue(pharmacyEntity);
      const result = pharmacyService.retrievePharmacyById("healthmart");
      expect(result).toEqual(pharmacyDto);
    });
  });

  describe("updatePharmacy", () => {
    // in case the request payload is malformatted
    describe("with invalid request payload", () => {
      it("throws an error if empty payload", () => {
        try {
          const result = pharmacyService.updatePharmacy("healthmart", {});
        } catch (error) {
          expect(error).toBeInstanceOf(Joi.ValidationError);
        }
      });
    });

    it("throws an error if pharmacy was not found", async () => {
      // in case database cannot find target pharmacy to update
      mockPharmacyRepo.get = jest.fn().mockReturnValue(undefined);
      try {
        const result = pharmacyService.updatePharmacy(
          "testPharmacy",
          pharmacyUpdateRequestPayload
        );
      } catch (error) {
        expect(error).toMatchObject(PharmacyNotFound);
      }
    });

    it("return pharmacy dto after update", async () => {
      mockPharmacyRepo.get = jest.fn().mockReturnValue(pharmacyEntity);
      mockPharmacyRepo.update = jest
        .fn()
        .mockReturnValue(pharmacyEntityAfterUpdate);

      const result = pharmacyService.updatePharmacy(
        "healthmart",
        pharmacyUpdateRequestPayload
      );

      expect(mockPharmacyRepo.update).toHaveBeenCalledWith(
        pharmacyEntityAfterUpdate
      );
      expect(result).toEqual(pharmacyDtoAfterUpdate);
    });
  });

  describe("deletePharmacy", () => {
    it("execute successfully", async () => {
      mockPharmacyRepo.delete = jest.fn();
      pharmacyService.deletePharmacy("healthmart");
      expect(mockPharmacyRepo.delete).toHaveBeenCalledWith("healthmart");
    });
  });

  describe("addPharmacyProducts", () => {
    // in case the request payload is malformatted
    describe("with invalid request payload", () => {
      it("throws an error if empty payload", () => {
        try {
          pharmacyService.addPharmacyProducts("healthmart", []);
        } catch (error) {
          expect(error).toBeInstanceOf(Joi.ValidationError);
        }
      });
    });

    it("throws an error if pharmacy was not found", () => {
      // in case database cannot find target pharmacy to update
      mockPharmacyRepo.get = jest.fn().mockReturnValue(undefined);
      try {
        const result = pharmacyService.addPharmacyProducts(
          "testPharmacy",
          pharmacyProductRequestPayload
        );
      } catch (error) {
        expect(error).toMatchObject(PharmacyNotFound);
      }
    });

    it("return Pharmacy dto with products after save", () => {
      mockPharmacyRepo.get = jest
        .fn()
        .mockReturnValue(structuredClone(pharmacyEntity));
      mockPharmacyRepo.update = jest
        .fn()
        .mockReturnValue(pharmacyEntityWithProducts);

      const result = pharmacyService.addPharmacyProducts(
        "healthmart",
        pharmacyProductRequestPayload
      );

      expect(mockPharmacyRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...pharmacyEntityWithProducts,
          // product should be concat to the pharmacy entity
          products: pharmacyEntityWithProducts.products.map((product) => ({
            ...product,
            id: expect.anything(),
          })),
        })
      );
      expect(result).toEqual(pharmacyEntityWithProductsDto);
    });

    it("return original Pharmacy dto if trying to add product that exists", () => {
      mockPharmacyRepo.get = jest
        .fn()
        .mockReturnValue(structuredClone(pharmacyEntityWithProducts));
      mockPharmacyRepo.update = jest.fn();

      const result = pharmacyService.addPharmacyProducts(
        "healthmart",
        pharmacyProductRequestPayload
      );

      // product should not be added to pharmacy, and triggering update if existing product found
      expect(mockPharmacyRepo.update).not.toHaveBeenCalled();
      expect(result).toEqual(pharmacyEntityWithProductsDto);
    });
  });

  describe("updatePharmacyProduct", () => {
    // in case the request payload is malformatted
    describe("with invalid request payload", () => {
      it('throws an error if invalid pharmacy "label" property', () => {
        const targetPayload = structuredClone(
          pharmacyProductUpdateRequestPayload
        );
        targetPayload.label = "";

        try {
          const result = pharmacyService.updatePharmacyProduct(
            "healthmart",
            pharmacyEntityWithProducts.products[0].id,
            targetPayload
          );
        } catch (error) {
          expect(error).toBeInstanceOf(Joi.ValidationError);
        }
      });
    });

    it("throws an error if pharmacy was not found", () => {
      // in case database cannot find target pharmacy to update
      mockPharmacyRepo.get = jest.fn().mockReturnValue(undefined);
      try {
        const result = pharmacyService.updatePharmacyProduct(
          "healthmart",
          pharmacyEntityWithProducts.products[0].id,
          pharmacyProductUpdateRequestPayload
        );
      } catch (error) {
        expect(error).toMatchObject(PharmacyNotFound);
      }
    });

    it("throws an error if pharmacy product with Id was not found", () => {
      // in case database cannot find target pharmacy product (with same productId, i.e. testProductId) to update
      mockPharmacyRepo.get = jest
        .fn()
        .mockReturnValue(structuredClone(pharmacyEntityWithProducts));
      try {
        pharmacyService.updatePharmacyProduct(
          "healthmart",
          "testProductId",
          pharmacyProductUpdateRequestPayload
        );
      } catch (error) {
        expect(error).toMatchObject(PharmacyProductNotFound);
      }
    });

    it("throws an error if pharmacy product with integrationName was not found", () => {
      // in case database cannot find target pharmacy product (with same integrationName) to update
      mockPharmacyRepo.get = jest
        .fn()
        .mockReturnValue(structuredClone(pharmacyEntityWithProducts));

      try {
        pharmacyService.updatePharmacyProduct(
          "healthmart",
          pharmacyEntityWithProducts.products[0].id,
          pharmacyProductUpdateRequestUnknownProductPayload
        );
      } catch (error) {
        expect(error).toMatchObject(PharmacyProductNotFound);
      }
    });

    it("return pharmacy dto after save", () => {
      mockPharmacyRepo.get = jest
        .fn()
        .mockReturnValue(structuredClone(pharmacyEntityWithProducts));
      mockPharmacyRepo.update = jest
        .fn()
        .mockReturnValue(pharmacyEntityWithProductsAfterUpdate);

      const result = pharmacyService.updatePharmacyProduct(
        "healthmart",
        pharmacyEntityWithProducts.products[0].id,
        pharmacyProductUpdateRequestPayload
      );

      expect(mockPharmacyRepo.update).toHaveBeenCalledWith(
        pharmacyEntityWithProductsAfterUpdate
      );
      expect(result).toEqual(pharmacyEntityWithProductsAfterUpdateDto);
    });
  });

  describe("deletePharmacyProduct", () => {
    it("throws an error if pharmacy was not found", () => {
      // in case database cannot find target pharmacy
      mockPharmacyRepo.get = jest.fn().mockReturnValue(undefined);
      mockPharmacyRepo.update = jest.fn();
      try {
        const result = pharmacyService.deletePharmacyProduct(
          "testPharmacy",
          pharmacyEntityWithProducts.products[0].id
        );
      } catch (error) {
        expect(error).toMatchObject(PharmacyNotFound);
      }
      expect(mockPharmacyRepo.update).not.toHaveBeenCalled();
    });

    it("throws an error if pharmacy product with Id was not found", () => {
      // in case database cannot find target pharmacy product to delete
      mockPharmacyRepo.get = jest
        .fn()
        .mockReturnValue(structuredClone(pharmacyEntityWithProducts));
      mockPharmacyRepo.update = jest.fn();
      try {
        pharmacyService.deletePharmacyProduct("healthmart", "testProductId");
      } catch (error) {
        expect(error).toMatchObject(PharmacyProductNotFound);
      }
      expect(mockPharmacyRepo.update).not.toHaveBeenCalled();
    });

    it("return pharmacy dto after soft delete", () => {
      mockPharmacyRepo.get = jest
        .fn()
        .mockReturnValue(structuredClone(pharmacyEntityWithProducts));
      mockPharmacyRepo.update = jest
        .fn()
        .mockReturnValue(pharmacyEntityWithProductsAfterDelete);

      const result = pharmacyService.deletePharmacyProduct(
        "healthmart",
        pharmacyEntityWithProducts.products[0].id
      );
      // check if pharmacy product marks isActive = false
      expect(mockPharmacyRepo.update).toHaveBeenCalledWith(
        pharmacyEntityWithProductsAfterDelete
      );
      // dto should not have the deleted product
      expect(result).toEqual(pharmacyEntityWithProductsAfterDeleteDto);
    });
  });
});

/* functions */
const createPharmacyDto = (entity: PharmacyEntity): PharmacyDto => {
  return {
    id: entity.id,
    createAt: entity.createAt,
    updateAt: entity.updateAt,
    name: entity.name,
    integrationName: entity.integrationName,
    address: entity.address,
    city: entity.city,
    state: entity.state,
    zipcode: entity.zipcode,
    country: entity.country,
    fax: entity.fax,
    phone: entity.phone,
    products: entity.products
      .filter((product) => product.isActive == true)
      .map((product) => ({
        id: product.id,
        label: product.label,
        integrationName: product.integrationName,
      })),
  };
};

/* Pharmacy Related */
const pharmacyRequestPayload: PharmacyRequestPayload = {
  integrationName: "healthmart",
  name: "HealthMart Pharmacy",
  address: "123 Main St",
  city: "Cityville",
  state: "Stateville",
  zipcode: "12345",
  country: "Countryland",
  fax: "123-456-7890",
  phone: "987-654-3210",
};

const pharmacyUpdateRequestPayload: PharmacyUpdateRequestPayload = {
  name: "HealthMart Pharmacy By Tester01",
  city: "Hong Kong",
};

const pharmacyEntity: PharmacyEntity = {
  id: pharmacyRequestPayload.integrationName,
  createAt: new Date(),
  updateAt: new Date(),
  isActive: true,
  products: [],
  ...pharmacyRequestPayload,
};

const { isActive, ...pharmacyDto } = pharmacyEntity;

const pharmacyEntityAfterUpdate: PharmacyEntity = {
  ...pharmacyEntity,
  ...pharmacyUpdateRequestPayload,
};

const { isActive: isActiveAfterUpdate, ...pharmacyDtoAfterUpdate } =
  pharmacyEntityAfterUpdate;

/* Pharmacy Product Related */
const pharmacyProductRequestPayload: PharmacyProductRequestPayload[] = [
  {
    label: "Pain killer",
    integrationName: "Painkiller",
  },
  {
    label: "Tylenol",
    integrationName: "Tylenol",
  },
];

const pharmacyEntityWithProducts: PharmacyEntity = {
  ...pharmacyEntity,
  products: pharmacyProductRequestPayload.map((payload) => ({
    ...payload,
    id: randomUUID().replace(/-/g, ""),
    isActive: true,
  })),
};

const pharmacyEntityWithProductsDto = createPharmacyDto(
  pharmacyEntityWithProducts
);

const pharmacyProductUpdateRequestPayload: PharmacyProductRequestPayload = {
  label: "Pain killer by Tester01",
  integrationName: "Painkiller",
};

const pharmacyProductUpdateRequestUnknownProductPayload: PharmacyProductRequestPayload =
  {
    label: "Pain killer by Tester01",
    integrationName: "UnknownProduct",
  };

const pharmacyEntityWithProductsAfterUpdate: PharmacyEntity = {
  ...pharmacyEntityWithProducts,
  products: pharmacyEntityWithProducts.products.map((product) => ({
    ...product,
    label:
      product.integrationName ===
      pharmacyProductUpdateRequestPayload.integrationName
        ? pharmacyProductUpdateRequestPayload.label
        : product.label,
  })),
};

const pharmacyEntityWithProductsAfterUpdateDto = createPharmacyDto(
  pharmacyEntityWithProductsAfterUpdate
);

const pharmacyEntityWithProductsAfterDelete: PharmacyEntity = {
  ...pharmacyEntityWithProducts,
  products: pharmacyEntityWithProducts.products.map((product, idx) => ({
    ...product,
    isActive: idx == 0 ? false : true,
  })),
};

const pharmacyEntityWithProductsAfterDeleteDto = createPharmacyDto(
  pharmacyEntityWithProductsAfterDelete
);
