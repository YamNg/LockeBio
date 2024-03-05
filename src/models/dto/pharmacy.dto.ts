import {
  PharmacyEntity,
  PharmacyProductEntity,
} from "../entity/pharmacy.entity.js";
import { DataDto } from "./data.dto.interface.js";

// Classes for constructing response for PharmacyEntity
export class PharmacyProductDto implements DataDto {
  id: string;
  label: string;
  integrationName: string;

  constructor(entity: PharmacyProductEntity) {
    this.id = entity.id;
    this.label = entity.label;
    this.integrationName = entity.integrationName;
  }
}

export class PharmacyDto implements DataDto {
  id?: string;
  createAt?: Date;
  updateAt?: Date;
  name: string;
  integrationName: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  fax: string;
  phone: string;
  products: PharmacyProductDto[];

  constructor(entity: PharmacyEntity) {
    this.id = entity.id;
    this.createAt = entity.createAt;
    this.updateAt = entity.updateAt;
    this.name = entity.name;
    this.integrationName = entity.integrationName;
    this.address = entity.address;
    this.city = entity.city;
    this.state = entity.state;
    this.zipcode = entity.zipcode;
    this.country = entity.country;
    this.fax = entity.fax;
    this.phone = entity.phone;
    this.products = entity.products
      .filter((product) => product.isActive === true)
      .map((entity) => new PharmacyProductDto(entity));
  }
}
