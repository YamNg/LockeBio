import axios from "axios";
import log4js from "../../config/logger/log4js.js";
import { OrderEntity } from "../../models/entity/order.entity.js";
import { OrderHandler } from "./order-handler.interface.js";
import { QuickCareOrderRequestPayload } from "../../models/payload/request/quickcare-order-request-payload.js";
import { QuickCareOrderResponsePayload } from "../../models/payload/response/quickcare-response-payloads.interface.js";
import { AppError } from "../../models/error/app-error.js";
import { orderHandlerApiConfigNotFound } from "../../constants/app-error.constant.js";

// QuickCare Implementation of OrderHandler class, for communicating with its external api
export class QuickCareOrderHandler implements OrderHandler {
  apiDomain;
  logger = log4js.getLogger();

  constructor(apiDomain: string) {
    this.apiDomain = apiDomain;
  }

  // method to add order to external api
  async addOrder(entity: OrderEntity): Promise<string> {
    if (!this.apiDomain) throw new AppError(orderHandlerApiConfigNotFound);

    const requestPayload = new QuickCareOrderRequestPayload(entity);
    const url = `${this.apiDomain}/orders`;

    // call QuickCare create order external api
    const { data } = await axios.post<QuickCareOrderResponsePayload>(
      url,
      requestPayload
    );
    // return id used by QuickCare referenced to the Order
    return data.quickCareId;
  }

  // method to retrieve order from external api
  async retrieveOrderById(
    orderIntegrationId: string
  ): Promise<QuickCareOrderResponsePayload> {
    if (!this.apiDomain) throw new AppError(orderHandlerApiConfigNotFound);

    // call QuickCare external api to retrieve order by id
    const url = `${this.apiDomain}/orders/${orderIntegrationId}`;

    const { data } = await axios.get<QuickCareOrderResponsePayload>(url);
    return data;
  }
}

export const quickCareOrderHandler = new QuickCareOrderHandler(
  process.env.QUICKCARE_API || ""
);
