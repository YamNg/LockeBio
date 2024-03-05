import { NextFunction, Request, Response } from "express";
import { GenericResponseDto } from "../models/dto/generic-response.dto.js";
import {
  PharmacyRequestPayload,
  PharmacyProductRequestPayload,
  PharmacyUpdateRequestPayload,
} from "../models/payload/request/pharmacy-request-payloads.interface.js";
import { pharmacyService } from "../services/pharmacy.service.js";

// Pharmacy Controller Methods which receive order request from routes

// Controller method handling add pharmacy request
export const addPharmacy = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body }: { body: PharmacyRequestPayload } = req;
    // call order service to addPharmacy
    const pharmacyDto = pharmacyService.addPharmacy(body);

    // create GenericResponseDto for response
    res.status(200).send(
      new GenericResponseDto({
        isSuccess: true,
        body: pharmacyDto,
      })
    );
  } catch (err) {
    next(err);
  }
};

// Controller method handling get pharmacy by id request
export const getPharmacyById = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pharmacyId = req.params.pharmacyId;
    // call pharmacy service to retrieve pharmacy by id
    const pharmacyDto = pharmacyService.retrievePharmacyById(pharmacyId);

    // create GenericResponseDto for response
    res.status(200).send(
      new GenericResponseDto({
        isSuccess: true,
        body: pharmacyDto,
      })
    );
  } catch (err) {
    next(err);
  }
};

// Controller method handling get all pharmacy request
export const getAllPharmacies = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // call pharmacy service to retrieve all pharmacy
    const pharmacyDtoList = pharmacyService.retrievePharmacies();

    // create GenericResponseDto for response
    res.status(200).send(
      new GenericResponseDto({
        isSuccess: true,
        body: pharmacyDtoList,
      })
    );
  } catch (err) {
    next(err);
  }
};

// Controller method handling update pharmacy request
export const updatePharmacy = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body }: { body: PharmacyUpdateRequestPayload } = req;
    const pharmacyId = req.params.pharmacyId;

    // call pharmacy service to update pharmacy
    const pharmacyDto = pharmacyService.updatePharmacy(pharmacyId, body);

    // create GenericResponseDto for response
    res.status(200).send(
      new GenericResponseDto({
        isSuccess: true,
        body: pharmacyDto,
      })
    );
  } catch (err) {
    next(err);
  }
};

// Controller method handling (soft) delete pharmacy request
export const deletePharmacy = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pharmacyId = req.params.pharmacyId;
    // call pharmacy service to delete pharmacy
    pharmacyService.deletePharmacy(pharmacyId);

    // create GenericResponseDto for response
    res.status(200).send(
      new GenericResponseDto({
        isSuccess: true,
      })
    );
  } catch (err) {
    next(err);
  }
};

// Controller method handling add pharmacy products request
export const addPharmacyProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body }: { body: PharmacyProductRequestPayload[] } = req;
    const pharmacyId = req.params.pharmacyId;

    // call order service to addPharmacyProducts
    const result = pharmacyService.addPharmacyProducts(pharmacyId, body);

    // create GenericResponseDto for response
    res.status(201).send(
      new GenericResponseDto({
        isSuccess: true,
        body: result,
      })
    );
  } catch (err) {
    next(err);
  }
};

// Controller method handling update pharmacy products request
export const updatePharmacyProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body }: { body: PharmacyProductRequestPayload } = req;
    const pharmacyId = req.params.pharmacyId;
    const pharmacyProductId = req.params.pharmacyProductId;

    // call order service to update pharmacy product
    const result = pharmacyService.updatePharmacyProduct(
      pharmacyId,
      pharmacyProductId,
      body
    );

    // create GenericResponseDto for response
    res.status(200).send(
      new GenericResponseDto({
        isSuccess: true,
        body: result,
      })
    );
  } catch (err) {
    next(err);
  }
};

// Controller method handling delete pharmacy products request
export const deletePharmacyProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pharmacyId = req.params.pharmacyId;
    const pharmacyProductId = req.params.pharmacyProductId;

    // call order service to delete pharmacy product
    const result = pharmacyService.deletePharmacyProduct(
      pharmacyId,
      pharmacyProductId
    );

    // create GenericResponseDto for response
    res.status(200).send(
      new GenericResponseDto({
        isSuccess: true,
        body: result,
      })
    );
  } catch (err) {
    next(err);
  }
};
