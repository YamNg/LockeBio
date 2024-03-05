import Joi from "joi";
import { pharmacyIntegrationName } from "../../constants/pharmacy.constant.js";

// Validators for Order Request
const orderCustomerEntityValidator = Joi.object({
  fullName: Joi.string().min(1).max(1000).required(),
  address: Joi.string().min(1).max(2000).required(),
  city: Joi.string().min(1).max(100).required(),
  state: Joi.string().min(1).max(100).required(),
  zipCode: Joi.string().min(1).max(100).required(),
  country: Joi.string().min(1).max(100).required(),
}).unknown(false);

export const orderEntityValidator = Joi.object({
  productId: Joi.string().min(1).max(50).required(),
  quantity: Joi.number().min(1).max(1000).required(),
  customer: orderCustomerEntityValidator,
}).unknown(false);
