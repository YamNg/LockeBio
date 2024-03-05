import { UnsupportedOrderHandler } from "../../constants/app-error.constant.js";
import { pharmacyIntegrationName } from "../../constants/pharmacy.constant.js";
import { AppError } from "../../models/error/app-error.js";
import { carePlusOrderHandler } from "./careplus-order-handler.js";
import { healthMartOrderHandler } from "./healthmart-order-handler.js";
import { OrderHandler } from "./order-handler.interface.js";
import { quickCareOrderHandler } from "./quickcare-order-handler.js";

// receive pharmacy integration name and return related orderHandler for specified pharmacy
export const getOrderHandler = (pharmacyName: string): OrderHandler => {
  switch (pharmacyName) {
    case pharmacyIntegrationName.HEALTHMART:
      return healthMartOrderHandler;
    case pharmacyIntegrationName.CAREPLUS:
      return carePlusOrderHandler;
    case pharmacyIntegrationName.QUICKCARE:
      return quickCareOrderHandler;
    default:
      throw new AppError(UnsupportedOrderHandler);
  }
};
