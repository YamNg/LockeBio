import Joi from "joi";

// Validators for Pharmacy Request
export const pharmacyEntityValidator = Joi.object({
  integrationName: Joi.string().min(1).max(100).required(),
  name: Joi.string().min(1).max(255).required(),
  address: Joi.string().min(1).max(1000).required(),
  city: Joi.string().min(1).max(100).required(),
  state: Joi.string().min(1).max(100).required(),
  zipcode: Joi.string().min(1).max(20).required(),
  country: Joi.string().min(1).max(100).required(),
  fax: Joi.string().min(1).max(20).required(),
  phone: Joi.string().min(1).max(20).required(),
}).unknown(false);

// all fields for update request is optional (i.e. no field is marked as required()), however need at least 1 field in the payload for update
export const pharmacyEntityUpdateValidator = Joi.object({
  name: Joi.string().min(1).max(255),
  address: Joi.string().min(1).max(1000),
  city: Joi.string().min(1).max(100),
  state: Joi.string().min(1).max(100),
  zipcode: Joi.string().min(1).max(20),
  country: Joi.string().min(1).max(100),
  fax: Joi.string().min(1).max(20),
  phone: Joi.string().min(1).max(20),
})
  .unknown(false)
  .min(1);

// pharmacy product request payload was an array, which products can be add all at once
// i.e. need to check if the payload is an array, with minimum 1 item
export const pharmacyProductEntityValidator = Joi.object({
  label: Joi.string().min(1).max(255).required(),
  integrationName: Joi.string().min(1).max(100).required(),
}).unknown(false);

export const pharmacyProductEntityArrValidator = Joi.array()
  .min(1)
  .items(pharmacyProductEntityValidator);
