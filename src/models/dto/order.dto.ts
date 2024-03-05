import {
  OrderCustomerEntity,
  OrderEntity,
  OrderPharmacyEntity,
  OrderProductEntity,
} from "../entity/order.entity.js";
import { DataDto } from "./data.dto.interface.js";

// Classes for constructing response for OrderEntity
export class OrderCustomerDto {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  constructor(entity: OrderCustomerEntity) {
    this.fullName = entity.fullName;
    this.address = entity.address;
    this.city = entity.city;
    this.state = entity.state;
    this.zipCode = entity.zipCode;
    this.country = entity.country;
  }
}

export class OrderPharmacyDto {
  id?: string;
  integrationName: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  fax: string;
  phone: string;

  constructor(pharmacyEntity: OrderPharmacyEntity) {
    this.id = pharmacyEntity.id;
    this.integrationName = pharmacyEntity.integrationName;
    this.name = pharmacyEntity.name;
    this.address = pharmacyEntity.address;
    this.city = pharmacyEntity.city;
    this.state = pharmacyEntity.state;
    this.zipcode = pharmacyEntity.zipcode;
    this.country = pharmacyEntity.country;
    this.fax = pharmacyEntity.fax;
    this.phone = pharmacyEntity.phone;
  }
}

export class OrderProductDto {
  id: string;
  label: string;
  integrationName: string;

  constructor(entity: OrderProductEntity) {
    this.id = entity.id;
    this.label = entity.label;
    this.integrationName = entity.integrationName;
  }
}

export class OrderDto implements DataDto {
  id?: string;
  createAt?: Date;
  updateAt?: Date;
  integrationId?: string;
  pharmacy: OrderPharmacyDto;
  status: string;
  product: OrderProductDto;
  quantity: number;
  customer: OrderCustomerDto;
  externalResult?: any;

  constructor(entity: OrderEntity) {
    this.id = entity.id;
    this.createAt = entity.createAt;
    this.updateAt = entity.updateAt;
    this.integrationId = entity.integrationId;
    this.pharmacy = new OrderPharmacyDto(entity.pharmacy);
    this.status = entity.status;
    this.product = new OrderProductDto(entity.product);
    this.quantity = entity.quantity;
    this.customer = new OrderCustomerDto(entity.customer);
  }
}
