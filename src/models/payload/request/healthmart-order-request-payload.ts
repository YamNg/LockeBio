import { OrderCustomerEntity, OrderEntity } from "../../entity/order.entity.js";

// payload class for constructing request to external HealthMart api
export class HealthMartCustomerInfoRequestPayload {
  healthMartCustName: string;
  healthMartCustAddress: string;
  healthMartCustCity: string;
  healthMartCustState: string;
  healthMartCustZipcode: string;
  healthMartCustCountry: string;

  constructor(entity: OrderCustomerEntity) {
    this.healthMartCustName = entity.fullName;
    this.healthMartCustAddress = entity.address;
    this.healthMartCustCity = entity.city;
    this.healthMartCustState = entity.state;
    this.healthMartCustZipcode = entity.zipCode;
    this.healthMartCustCountry = entity.country;
  }
}

export class HealthMartOrderRequestPayload {
  healthMartProduct: string;
  healthMartQuantity: number;
  healthMartCustomerInfo: HealthMartCustomerInfoRequestPayload;

  constructor(entity: OrderEntity) {
    this.healthMartProduct = entity.product.integrationName;
    this.healthMartQuantity = entity.quantity;
    this.healthMartCustomerInfo = new HealthMartCustomerInfoRequestPayload(
      entity.customer
    );
  }
}
