// interface classes for specifying signature of Api response from external QuickCare api
export interface QuickCareUserDataResponsePayload {
  quickCareUserName: string;
  quickCareUserAddress: string;
  quickCareUserCity: string;
  quickCareUserState: string;
  quickCareUserZipcode: string;
  quickCareUserCountry: string;
}

export interface QuickCareOrderResponsePayload {
  quickCareId: string;
  quickCareProduct: string;
  quickCareQuantity: number;
  quickCareUserData: QuickCareUserDataResponsePayload;
}
