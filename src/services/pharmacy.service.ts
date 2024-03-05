import log4js from "../config/logger/log4js.js";
import {
  PharmacyNotFound,
  PharmacyProductNotFound,
} from "../constants/app-error.constant.js";
import { PharmacyDto } from "../models/dto/pharmacy.dto.js";
import {
  PharmacyEntity,
  PharmacyProductEntity,
} from "../models/entity/pharmacy.entity.js";
import { AppError } from "../models/error/app-error.js";
import {
  PharmacyRequestPayload,
  PharmacyProductRequestPayload,
  PharmacyUpdateRequestPayload,
} from "../models/payload/request/pharmacy-request-payloads.interface.js";
import {
  pharmacyEntityUpdateValidator,
  pharmacyEntityValidator,
  pharmacyProductEntityArrValidator,
  pharmacyProductEntityValidator,
} from "../utils/validators/pharmacy-request.validator.js";
import { pharmacyRepository } from "../repositories/node-cache.repository.js";

// Service class holding the business logic for pharmacy related operations
class PharmacyService {
  logger = log4js.getLogger();

  /* Pharmacy Related */

  // method for adding new pharmacy
  addPharmacy(data: PharmacyRequestPayload): PharmacyDto {
    // validate data
    const { error } = pharmacyEntityValidator.validate(data);
    if (error) throw error;

    // insert data and return as dto
    return new PharmacyDto(pharmacyRepository.insert(new PharmacyEntity(data)));
  }

  // method for retrieving all pharmacies
  retrievePharmacies(): PharmacyDto[] {
    // retrieve data and return as dto array
    const pharmacyDtoList = pharmacyRepository
      .getAll()
      .map((entity) => new PharmacyDto(entity));

    return pharmacyDtoList;
  }

  // method for retrieving a pharmacy by Id
  retrievePharmacyById(pharmacyId: string): PharmacyDto {
    const entity = pharmacyRepository.get(pharmacyId);
    if (!entity) throw new AppError(PharmacyNotFound);

    // retrieve data and return as dto
    return new PharmacyDto(entity);
  }

  // method for updating a pharmacy
  updatePharmacy(
    pharmacyId: string,
    data: PharmacyUpdateRequestPayload
  ): PharmacyDto {
    // validate data
    const { error } = pharmacyEntityUpdateValidator.validate(data);
    if (error) throw error;

    // find existing pharmacy entity to update
    let targetPharmacyData = pharmacyRepository.get(pharmacyId);
    if (!targetPharmacyData) throw new AppError(PharmacyNotFound);

    // replace entity properties
    targetPharmacyData = { ...targetPharmacyData, ...data };

    // execute update and return as dto
    return new PharmacyDto(pharmacyRepository.update(targetPharmacyData));
  }

  // method for (soft) deleting a pharmacy
  deletePharmacy(pharmacyId: string): void {
    // execute deletion
    pharmacyRepository.delete(pharmacyId);
  }

  /* Pharmacy Product Related Methods */

  // method for adding products to pharmacy
  addPharmacyProducts(
    pharmacyId: string,
    data: PharmacyProductRequestPayload[]
  ): PharmacyDto {
    // validate data
    const { error } = pharmacyProductEntityArrValidator.validate(data);
    if (error) throw error;

    // find existing pharmacy entity to update
    const targetPharmacyData = pharmacyRepository.get(pharmacyId);
    if (!targetPharmacyData) throw new AppError(PharmacyNotFound);

    // add entry to the list of products
    let isUpdate = false;
    data.forEach((productPayload) => {
      // if existing product was found (with same integrationName), skip to add the product
      if (
        targetPharmacyData.products.findIndex(
          (product) =>
            product.integrationName === productPayload.integrationName &&
            product.isActive === true
        ) != -1
      ) {
        this.logger.debug(
          `Pharmacy product: ${JSON.stringify(
            productPayload
          )} already exists for Pharmacy: ${pharmacyId}, skipped adding to entity`
        );
      } else {
        isUpdate = true;
        targetPharmacyData.products = targetPharmacyData.products.concat(
          new PharmacyProductEntity(
            productPayload.label,
            productPayload.integrationName
          )
        );
      }
    });

    // execute update on Pharmacy entity and return as dto if there are update
    let result = isUpdate
      ? pharmacyRepository.update(targetPharmacyData)
      : targetPharmacyData;

    return new PharmacyDto(result);
  }

  // method for updating pharmacy products
  updatePharmacyProduct(
    pharmacyId: string,
    pharmacyProductId: string,
    data: PharmacyProductRequestPayload
  ) {
    // validate data
    const { error } = pharmacyProductEntityValidator.validate(data);
    if (error) throw error;

    // find existing pharmacy entity to update
    const targetPharmacyData = pharmacyRepository.get(pharmacyId);
    if (!targetPharmacyData) throw new AppError(PharmacyNotFound);

    let isUpdated = false;
    targetPharmacyData.products = targetPharmacyData.products.map((product) => {
      // loop the product array to find targeted product
      if (
        product.integrationName === data.integrationName &&
        product.id === pharmacyProductId &&
        product.isActive === true
      ) {
        // update the product, currently only label was allowed to be updated
        isUpdated = true;
        return { ...product, label: data.label };
      } else {
        return product;
      }
    });
    if (!isUpdated) throw new AppError(PharmacyProductNotFound);

    // execute update on Pharmacy entity and return as dto
    return new PharmacyDto(pharmacyRepository.update(targetPharmacyData));
  }

  // method for (soft) deleting pharmacy products
  deletePharmacyProduct(pharmacyId: string, pharmacyProductId: string) {
    // find existing pharmacy entity to update
    const targetPharmacyData = pharmacyRepository.get(pharmacyId);
    if (!targetPharmacyData) throw new AppError(PharmacyNotFound);

    let isUpdated = false;
    targetPharmacyData.products = targetPharmacyData.products.map((product) => {
      // loop the product array to find targeted product
      if (product.id === pharmacyProductId && product.isActive === true) {
        isUpdated = true;
        // update the isActive flag
        return { ...product, isActive: false };
      } else {
        return product;
      }
    });
    if (!isUpdated) throw new AppError(PharmacyProductNotFound);

    // execute update on Pharmacy entity and return as dto
    return new PharmacyDto(pharmacyRepository.update(targetPharmacyData));
  }
}

export const pharmacyService = new PharmacyService();
