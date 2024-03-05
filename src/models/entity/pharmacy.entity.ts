import { randomUUID } from "crypto";
import { PharmacyRequestPayload } from "../payload/request/pharmacy-request-payloads.interface.js";
import { Entity } from "./entity.interface.js";

// classes for constructing object to store Pharmacy Entity in database
export class PharmacyProductEntity implements Entity {
  id: string;
  isActive: boolean;
  label: string;
  integrationName: string;

  constructor(label: string, integrationName: string) {
    this.id = randomUUID().replace(/-/g, "");
    this.isActive = true;
    this.label = label;
    this.integrationName = integrationName;
  }
}

export class PharmacyEntity implements Entity {
  id?: string;
  createAt?: Date;
  updateAt?: Date;
  isActive: boolean;
  integrationName: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  fax: string;
  phone: string;
  products: PharmacyProductEntity[];

  constructor(payload: PharmacyRequestPayload) {
    this.id = payload.integrationName;
    this.isActive = true;
    this.integrationName = payload.integrationName;
    this.name = payload.name;
    this.address = payload.address;
    this.city = payload.city;
    this.state = payload.state;
    this.zipcode = payload.zipcode;
    this.country = payload.country;
    this.fax = payload.fax;
    this.phone = payload.phone;
    this.products = [];
  }
}
