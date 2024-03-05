import { OrderCustomerEntity, OrderEntity } from "../../entity/order.entity.js";

// payload class for constructing request to external QuickCare api
export class QuickCareUserDataRequestPayload {
  quickCareUserName: string;
  quickCareUserAddress: string;
  quickCareUserCity: string;
  quickCareUserState: string;
  quickCareUserZipcode: string;
  quickCareUserCountry: string;

  constructor(entity: OrderCustomerEntity) {
    this.quickCareUserName = entity.fullName;
    this.quickCareUserAddress = entity.address;
    this.quickCareUserCity = entity.city;
    this.quickCareUserState = entity.state;
    this.quickCareUserZipcode = entity.zipCode;
    this.quickCareUserCountry = entity.country;
  }
}

export class QuickCareOrderRequestPayload {
  quickCareProduct: string;
  quickCareQuantity: number;
  quickCareUserData: QuickCareUserDataRequestPayload;

  constructor(entity: OrderEntity) {
    this.quickCareProduct = entity.product.integrationName;
    this.quickCareQuantity = entity.quantity;
    this.quickCareUserData = new QuickCareUserDataRequestPayload(
      entity.customer
    );
  }
}
