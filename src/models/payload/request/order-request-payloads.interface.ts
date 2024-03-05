// interface classes for specifying signature of internal Order Api request payload
export interface OrderCustomerRequestPayload {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderRequestPayload {
  productId: string;
  quantity: number;
  customer: OrderCustomerRequestPayload;
}
