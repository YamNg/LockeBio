import { orderStatus } from "../../constants/order.constant.js";
import {
  OrderCustomerRequestPayload,
  OrderRequestPayload,
} from "../payload/request/order-request-payloads.interface.js";
import { StatefulEntity } from "./entity.interface.js";
import { PharmacyEntity, PharmacyProductEntity } from "./pharmacy.entity.js";

// classes for constructing object to store Order Entity in database
export class OrderCustomerEntity {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  constructor(payload: OrderCustomerRequestPayload) {
    this.fullName = payload.fullName;
    this.address = payload.address;
    this.city = payload.city;
    this.state = payload.state;
    this.zipCode = payload.zipCode;
    this.country = payload.country;
  }
}

export class OrderPharmacyEntity {
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

  constructor(pharmacyEntity: PharmacyEntity) {
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

export class OrderProductEntity {
  id: string;
  label: string;
  integrationName: string;

  constructor(pharmacyProductEntity: PharmacyProductEntity) {
    this.id = pharmacyProductEntity.id;
    this.label = pharmacyProductEntity.label;
    this.integrationName = pharmacyProductEntity.integrationName;
  }
}

export class OrderEntity implements StatefulEntity {
  id?: string;
  createAt?: Date;
  updateAt?: Date;
  isActive?: boolean;
  integrationId?: string;
  pharmacy: OrderPharmacyEntity;
  status: string;
  product: OrderProductEntity;
  quantity: number;
  customer: OrderCustomerEntity;

  constructor(
    payload: OrderRequestPayload,
    pharmacyEntity: PharmacyEntity,
    productEntity: PharmacyProductEntity
  ) {
    this.isActive = true;
    this.pharmacy = new OrderPharmacyEntity(pharmacyEntity);
    this.status = orderStatus.INITIATED;
    this.quantity = payload.quantity;
    this.customer = new OrderCustomerEntity(payload.customer);
    this.product = new OrderProductEntity(productEntity);
  }
}
