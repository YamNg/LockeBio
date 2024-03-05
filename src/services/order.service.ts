import log4js from "../config/logger/log4js.js";
import { OrderDto } from "../models/dto/order.dto.js";
import { OrderEntity } from "../models/entity/order.entity.js";
import { OrderRequestPayload } from "../models/payload/request/order-request-payloads.interface.js";
import { orderEntityValidator } from "../utils/validators/order-request.validator.js";
import { AppError } from "../models/error/app-error.js";
import { orderStatus } from "../constants/order.constant.js";
import {
  OrderPharmacyNotFound,
  OrderPharmacyProductNotFound,
  ExternalApiRequestFailure,
  OrderNotFound,
} from "../constants/app-error.constant.js";
import { getOrderHandler } from "../handlers/order/order-handler-factory.js";
import {
  orderRepository,
  pharmacyRepository,
} from "../repositories/node-cache.repository.js";

// Service class holding the business logic for order related operations
class OrderService {
  logger = log4js.getLogger();

  /* Order Related */

  // method for adding new order
  async addOrder(
    data: OrderRequestPayload,
    pharmacyId: string
  ): Promise<OrderDto> {
    // find existing pharmacy entity
    const pharmacy = pharmacyRepository.get(pharmacyId);
    if (!pharmacy) throw new AppError(OrderPharmacyNotFound);

    // validate data
    const { error } = orderEntityValidator.validate(data);
    if (error) throw error;

    // find product by Id in the request payload
    const product = pharmacy.products.find(
      (product) => product.id === data.productId
    );
    if (!product) throw new AppError(OrderPharmacyProductNotFound);

    // construct OrderEntity and add to database, status of the OrderEntity defaulted as "orderStatus.INITIATED"
    const createdEntity = orderRepository.insert(
      new OrderEntity(data, pharmacy, product)
    );

    let externalOrderId;
    let status = orderStatus.FAIL;
    try {
      // use factory to get orderHandler for different pharmacy, and call function to add order by calling external api
      externalOrderId = await getOrderHandler(
        createdEntity.pharmacy.integrationName
      ).addOrder(createdEntity);
      // change status of the order to "orderStatus.SENT" once the addOrder request succeeded
      status = orderStatus.SENT;
    } catch (err) {
      // throw error in case there are error caught when calling orderHandler
      this.logger.error(err);
      throw new AppError(ExternalApiRequestFailure);
    }

    // execute update to include external api order Id and status to the entity
    const result = orderRepository.update({
      ...createdEntity,
      integrationId: externalOrderId,
      status,
    });

    // return as dto
    return new OrderDto(result);
  }

  retrieveOrders(): OrderDto[] {
    // retrieve data and return as dto array
    const orderDtoList = orderRepository
      .getAll()
      .map((entity) => new OrderDto(entity));
    return orderDtoList;
  }

  async retrieveOrderById(
    orderId: string,
    queryExternal: boolean
  ): Promise<OrderDto> {
    // retrieve data
    const orderEntity = orderRepository.get(orderId);
    if (!orderEntity) throw new AppError(OrderNotFound);

    let orderDto = new OrderDto(orderEntity);

    // if queryExternal == true, then call external api to retrieve data
    if (orderEntity.integrationId && queryExternal) {
      try {
        const externalResult = await getOrderHandler(
          orderEntity.pharmacy.integrationName
        ).retrieveOrderById(orderEntity.integrationId);

        if (externalResult) orderDto.externalResult = externalResult;
      } catch (err) {
        this.logger.error(err);
        throw new AppError(ExternalApiRequestFailure);
      }
    }

    return orderDto;
  }
}

export const orderService = new OrderService();
