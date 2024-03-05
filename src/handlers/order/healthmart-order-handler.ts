import axios from "axios";
import log4js from "../../config/logger/log4js.js";
import { OrderEntity } from "../../models/entity/order.entity.js";
import { HealthMartOrderRequestPayload } from "../../models/payload/request/healthmart-order-request-payload.js";
import { HealthMartOrderResponsePayload } from "../../models/payload/response/healthmart-response-payloads.interface.js";
import { OrderHandler } from "./order-handler.interface.js";
import { AppError } from "../../models/error/app-error.js";
import { orderHandlerApiConfigNotFound } from "../../constants/app-error.constant.js";

// HealthMart Implementation of OrderHandler class, for communicating with its external api
export class HealthMartOrderHandler implements OrderHandler {
  apiDomain;
  logger = log4js.getLogger();

  constructor(apiDomain: string) {
    this.apiDomain = apiDomain;
  }

  // method to add order to external api
  async addOrder(entity: OrderEntity): Promise<string> {
    if (!this.apiDomain) throw new AppError(orderHandlerApiConfigNotFound);

    const requestPayload = new HealthMartOrderRequestPayload(entity);
    const url = `${this.apiDomain}/orders`;

    // call HealthMart create order external api
    const { data } = await axios.post<HealthMartOrderResponsePayload>(
      url,
      requestPayload
    );

    // return id used by HealthMart referenced to the Order
    return data.healthMartId;
  }

  // method to retrieve order from external api
  async retrieveOrderById(
    orderIntegrationId: string
  ): Promise<HealthMartOrderResponsePayload> {
    if (!this.apiDomain) throw new AppError(orderHandlerApiConfigNotFound);

    // call HealthMart external api to retrieve order by id
    const url = `${this.apiDomain}/orders/${orderIntegrationId}`;

    const { data } = await axios.get<HealthMartOrderResponsePayload>(url);
    return data;
  }
}

export const healthMartOrderHandler = new HealthMartOrderHandler(
  process.env.HEALTHMART_API || ""
);
