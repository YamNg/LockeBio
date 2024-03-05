import { OrderCustomerEntity, OrderEntity } from "../../entity/order.entity.js";

// payload class for constructing request to external CarePlus api
export class CarePlusClientInfoRequestPayload {
  carePlusClientName: string;
  carePlusClientAddress: string;
  carePlusClientCity: string;
  carePlusClientState: string;
  carePlusClientZipcode: string;
  carePlusClientCountry: string;

  constructor(entity: OrderCustomerEntity) {
    this.carePlusClientName = entity.fullName;
    this.carePlusClientAddress = entity.address;
    this.carePlusClientCity = entity.city;
    this.carePlusClientState = entity.state;
    this.carePlusClientZipcode = entity.zipCode;
    this.carePlusClientCountry = entity.country;
  }
}

export class CarePlusOrderRequestPayload {
  carePlusProduct: string;
  carePlusQuantity: number;
  carePlusClientInfo: CarePlusClientInfoRequestPayload;

  constructor(entity: OrderEntity) {
    this.carePlusProduct = entity.product.integrationName;
    this.carePlusQuantity = entity.quantity;
    this.carePlusClientInfo = new CarePlusClientInfoRequestPayload(
      entity.customer
    );
  }
}
