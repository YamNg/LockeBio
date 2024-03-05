import { NextFunction, Request, Response } from "express";
import { GenericResponseDto } from "../models/dto/generic-response.dto.js";
import { OrderRequestPayload } from "../models/payload/request/order-request-payloads.interface.js";
import { orderService } from "../services/order.service.js";

// Order Controller Methods which receive order request from routes

// Controller method handling add order request
export const addOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body }: { body: OrderRequestPayload } = req;
    const pharmacyId = req.params.pharmacyId;

    // call order service to addOrder
    const orderDto = await orderService.addOrder(body, pharmacyId);

    // create GenericResponseDto for response
    res.status(200).send(
      new GenericResponseDto({
        isSuccess: true,
        body: orderDto,
      })
    );
  } catch (err) {
    next(err);
  }
};

// Controller method handling get order by id request
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.orderId;
    const queryExternal = req.query.queryExternal === "true" ? true : false;

    // call order service to retrieve order by id
    // if queryExternal == true, response will also include the data retrieved from external api
    const orderDto = await orderService.retrieveOrderById(
      orderId,
      queryExternal
    );

    // create GenericResponseDto for response
    res.status(200).send(
      new GenericResponseDto({
        isSuccess: true,
        body: orderDto,
      })
    );
  } catch (err) {
    next(err);
  }
};

// Controller method handling get all orders request
export const getAllOrders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // call order service to get all orders
    const orderDtoList = orderService.retrieveOrders();

    // create GenericResponseDto for response
    res.status(200).send(
      new GenericResponseDto({
        isSuccess: true,
        body: orderDtoList,
      })
    );
  } catch (err) {
    next(err);
  }
};
