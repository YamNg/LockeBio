import axios from "axios";
import log4js from "../../config/logger/log4js.js";
import { OrderEntity } from "../../models/entity/order.entity.js";
import { OrderHandler } from "./order-handler.interface.js";
import { CarePlusOrderRequestPayload } from "../../models/payload/request/careplus-order-request-payload.js";
import { CarePlusOrderResponsePayload } from "../../models/payload/response/careplus-response-payloads.interface.js";
import { orderHandlerApiConfigNotFound } from "../../constants/app-error.constant.js";
import { AppError } from "../../models/error/app-error.js";

// CarePlus Implementation of OrderHandler class, for communicating with its external api
export class CarePlusOrderHandler implements OrderHandler {
  apiDomain;
  logger = log4js.getLogger();

  constructor(apiDomain: string) {
    this.apiDomain = apiDomain;
  }

  // method to add order to external api
  async addOrder(entity: OrderEntity): Promise<string> {
    if (!this.apiDomain) throw new AppError(orderHandlerApiConfigNotFound);

    const requestPayload = new CarePlusOrderRequestPayload(entity);
    const url = `${this.apiDomain}/orders`;

    // call CarePlus create order external api
    const { data } = await axios.post<CarePlusOrderResponsePayload>(
      url,
      requestPayload
    );

    // return id used by CarePlus referenced to the Order
    return data.carePlusId;
  }

  // method to retrieve order from external api
  async retrieveOrderById(
    orderIntegrationId: string
  ): Promise<CarePlusOrderResponsePayload> {
    if (!this.apiDomain) throw new AppError(orderHandlerApiConfigNotFound);

    // call CarePlus external api to retrieve order by id
    const url = `${this.apiDomain}/orders/${orderIntegrationId}`;

    const { data } = await axios.get<CarePlusOrderResponsePayload>(url);
    return data;
  }
}

export const carePlusOrderHandler = new CarePlusOrderHandler(
  process.env.CAREPLUS_API || ""
);
