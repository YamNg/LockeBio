import axios from "axios";
import { PharmacyEntity } from "../models/entity/pharmacy.entity.js";
import { databaseNamespace } from "../constants/database-namespace.constant.js";
import { PharmacyRequestPayload } from "../models/payload/request/pharmacy-request-payloads.interface.js";
import { pharmacyRepository } from "../repositories/node-cache.repository.js";

const initDatabase = async () => {
  const pharmacyApi = process.env.PHARMACY_API;

  if (!pharmacyApi) throw new Error("Pharmacy api configuration not found");

  // Call pharmacy api to retrieve default set of pharmacies
  const { data } = await axios.get<PharmacyRequestPayload[]>(pharmacyApi);
  data
    .map((payload) => new PharmacyEntity(payload))
    .forEach((entity) => pharmacyRepository.insert(entity));
};

export default initDatabase;
