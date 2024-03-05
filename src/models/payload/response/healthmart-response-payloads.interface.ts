// interface classes for specifying signature of Api response from external HealthMart api
export interface HealthMartCustomerInfoResponsePayload {
  healthMartCustName: string;
  healthMartCustAddress: string;
  healthMartCustCity: string;
  healthMartCustState: string;
  healthMartCustZipcode: string;
  healthMartCustCountry: string;
}

export interface HealthMartOrderResponsePayload {
  healthMartId: string;
  healthMartProduct: string;
  healthMartQuantity: number;
  healthMartCustomerInfo: HealthMartCustomerInfoResponsePayload;
}
