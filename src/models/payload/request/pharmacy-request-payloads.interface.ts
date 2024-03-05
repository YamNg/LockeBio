// interface classes for specifying signature of internal Pharmacy Api request payload
export interface PharmacyRequestPayload {
  integrationName: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  fax: string;
  phone: string;
}

export interface PharmacyUpdateRequestPayload {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  fax?: string;
  phone?: string;
}

export interface PharmacyProductRequestPayload {
  label: string;
  integrationName: string;
}
