// interface classes for specifying signature of Api response from external CarePlus api
export interface CarePlusClientInfoResponsePayload {
  carePlusClientName: string;
  carePlusClientAddress: string;
  carePlusClientCity: string;
  carePlusClientState: string;
  carePlusClientZipcode: string;
  carePlusClientCountry: string;
}

export interface CarePlusOrderResponsePayload {
  carePlusId: string;
  carePlusProduct: string;
  carePlusQuantity: number;
  carePlusClientInfo: CarePlusClientInfoResponsePayload;
}
