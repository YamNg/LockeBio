import { OrderEntity } from "../models/entity/order.entity.js";
import { getOrderHandler } from "../handlers/order/order-handler-factory.js";
import { orderService } from "./order.service.js";
import {
  orderRepository,
  pharmacyRepository,
} from "../repositories/node-cache.repository.js";
import {
  ExternalApiRequestFailure,
  OrderNotFound,
  OrderPharmacyNotFound,
  OrderPharmacyProductNotFound,
} from "../constants/app-error.constant.js";
import Joi from "joi";
import { OrderHandler } from "../handlers/order/order-handler.interface.js";
import { orderStatus } from "../constants/order.constant.js";
import { OrderRequestPayload } from "../models/payload/request/order-request-payloads.interface.js";
import { OrderDto } from "../models/dto/order.dto.js";
import { HealthMartOrderResponsePayload } from "../models/payload/response/healthmart-response-payloads.interface.js";
import { PharmacyEntity } from "../models/entity/pharmacy.entity.js";

jest.mock("../repositories/node-cache.repository.js");
jest.mock("../handlers/order/order-handler-factory");

let mockOrderRepo = jest.mocked(orderRepository);
let mockPharmacyRepo = jest.mocked(pharmacyRepository);
let mockOrderHandler: OrderHandler = {
  addOrder: jest.fn(),
  retrieveOrderById: jest.fn(),
};
let mockGetOrderHandler;

beforeEach(() => {
  mockGetOrderHandler = jest
    .mocked(getOrderHandler)
    .mockReturnValue(mockOrderHandler);
});

describe("OrderService", () => {
  describe("addOrder", () => {
    it("throws an error if the pharmacy was not found", async () => {
      // in case there was no pharmacy entity for the specific id found in database
      mockPharmacyRepo.get.mockReturnValueOnce(undefined);

      try {
        await orderService.addOrder(orderRequestPayload, "healthmart");
      } catch (error) {
        expect(error).toMatchObject(OrderPharmacyNotFound);
      }
    });

    // in case the request payload is malformatted
    describe("with invalid request payload", () => {
      it('throws an error if invalid order "productId" property', async () => {
        mockPharmacyRepo.get.mockReturnValueOnce(pharmacyEntity);
        const targetPayload = structuredClone(orderRequestPayload);
        targetPayload.productId = "";

        try {
          await orderService.addOrder(targetPayload, "healthmart");
        } catch (error) {
          expect(error).toBeInstanceOf(Joi.ValidationError);
        }
      });
      it('throws an error if invalid order-customer "fullName" property', async () => {
        mockPharmacyRepo.get.mockReturnValueOnce(pharmacyEntity);
        const targetPayload = structuredClone(orderRequestPayload);
        targetPayload.customer.fullName = "";

        try {
          await orderService.addOrder(targetPayload, "healthmart");
        } catch (error) {
          expect(error).toBeInstanceOf(Joi.ValidationError);
        }
      });
    });

    it("throws an error if product was not found in pharmacy", async () => {
      // in case there was no pharmacy product found with the specific id in request payload
      mockPharmacyRepo.get.mockReturnValueOnce(pharmacyEntity);
      const targetPayload = structuredClone(orderRequestPayload);
      targetPayload.productId = "testProductId";

      try {
        await orderService.addOrder(targetPayload, "healthmart");
      } catch (error) {
        expect(error).toMatchObject(OrderPharmacyProductNotFound);
      }
    });

    it("throws an error if order handler throw error", async () => {
      // in case order handler throw error
      mockPharmacyRepo.get.mockReturnValueOnce(pharmacyEntity);
      mockOrderRepo.insert.mockReturnValueOnce(orderEntity);
      mockOrderHandler.addOrder = jest
        .fn()
        .mockRejectedValueOnce(new Error("mock error thrown"));

      try {
        await orderService.addOrder(orderRequestPayload, "healthmart");
      } catch (error) {
        expect(error).toMatchObject(ExternalApiRequestFailure);
      }
    });

    it("return order dto after save with Id returned by external api and status", async () => {
      mockPharmacyRepo.get.mockReturnValueOnce(pharmacyEntity);
      mockPharmacyRepo.update.mockImplementationOnce((entity) => entity);
      mockOrderRepo.insert.mockReturnValueOnce(orderEntity);
      mockOrderHandler.addOrder = jest.fn().mockResolvedValueOnce("123456");

      const result = await orderService.addOrder(
        orderRequestPayload,
        "healthmart"
      );
      // result should have id returned by order handler, i.e. 123456 in this case, and also in dto format
      expect(result).toEqual(orderDto);
    });
  });

  describe("retrieveOrders", () => {
    it("should handle empty array returned by database", () => {
      // in case there was no data related to order
      mockOrderRepo.getAll.mockReturnValueOnce([]);
      const result = orderService.retrieveOrders();
      expect(result).toEqual([]);
    });

    it("return order dto array", () => {
      mockOrderRepo.getAll.mockReturnValueOnce([orderEntityAfterAddProcess]);
      const result = orderService.retrieveOrders();
      expect(result).toEqual([orderDto]);
    });
  });

  describe("retrieveOrderById", () => {
    it("throws an error if order was not found", async () => {
      // in case order cannot be found
      mockOrderRepo.get.mockReturnValueOnce(undefined);

      try {
        await orderService.retrieveOrderById("12345", false);
      } catch (error) {
        expect(error).toMatchObject(OrderNotFound);
      }
    });

    it("throws an error if order handler throw error when querying external api", async () => {
      // in case order handler throw error
      mockOrderRepo.get.mockReturnValueOnce(orderEntityAfterAddProcess);
      mockOrderHandler.retrieveOrderById = jest
        .fn()
        .mockRejectedValueOnce(new Error("mock error thrown"));

      try {
        await orderService.retrieveOrderById("123456", true);
      } catch (error) {
        expect(error).toMatchObject(ExternalApiRequestFailure);
      }
    });

    it("return order dto when not querying external api", async () => {
      // in case flag queryExternal = false
      mockOrderRepo.get.mockReturnValueOnce(orderEntityAfterAddProcess);
      const result = await orderService.retrieveOrderById("123456", false);
      expect(result).toEqual(orderDto);

      // external api should not be called
      expect(mockOrderHandler.retrieveOrderById).not.toHaveBeenCalled();
    });

    it("return order dto together with result querying from external api", async () => {
      // in case flag queryExternal = true
      mockOrderRepo.get.mockReturnValueOnce(orderEntityAfterAddProcess);
      mockOrderHandler.retrieveOrderById = jest
        .fn()
        .mockResolvedValueOnce(healthmartOrderResponse);

      const result = await orderService.retrieveOrderById("123456", true);
      // result should include externalResult retrieved from external api
      expect(result).toEqual({
        ...orderDto,
        externalResult: { ...healthmartOrderResponse },
      });
    });
  });
});

const pharmacyEntity: PharmacyEntity = {
  id: "healthmart",
  integrationName: "healthmart",
  name: "HealthMart Pharmacy",
  address: "123 Main St",
  city: "Cityville",
  state: "Stateville",
  zipcode: "12345",
  country: "Countryland",
  fax: "123-456-7890",
  phone: "987-654-3210",
  isActive: true,
  products: [
    {
      id: "648324056f0b42da8157ce1019c85873",
      label: "Pain killer",
      integrationName: "Painkiller",
      isActive: true,
    },
  ],
};

const orderRequestPayload: OrderRequestPayload = {
  productId: pharmacyEntity.products[0].id,
  quantity: 20,
  customer: {
    fullName: "Tester01",
    address: "Testing Address.",
    city: "Toronto",
    state: "ON",
    zipCode: "A0A0A0",
    country: "Canada",
  },
};

const orderEntity: OrderEntity = {
  id: "45a0b701aeb5425bab86436947c49933",
  createAt: new Date(),
  updateAt: new Date(),
  isActive: true,
  pharmacy: {
    id: "healthmart",
    integrationName: "healthmart",
    name: "HealthMart Pharmacy",
    address: "123 Main St",
    city: "Cityville",
    state: "Stateville",
    zipcode: "12345",
    country: "Countryland",
    fax: "123-456-7890",
    phone: "987-654-3210",
  },
  status: "sent",
  product: {
    id: "648324056f0b42da8157ce1019c85873",
    label: "Pain killer",
    integrationName: "Painkiller",
  },
  quantity: orderRequestPayload.quantity,
  customer: orderRequestPayload.customer,
};

const orderEntityAfterAddProcess: OrderEntity = {
  ...orderEntity,
  integrationId: "123456",
  status: orderStatus.SENT,
};

const orderDto: OrderDto = {
  id: orderEntity.id,
  createAt: orderEntity.createAt,
  updateAt: orderEntity.updateAt,
  integrationId: orderEntityAfterAddProcess.integrationId,
  pharmacy: orderEntity.pharmacy,
  status: "sent",
  product: orderEntity.product,
  quantity: 20,
  customer: orderEntity.customer,
};

const healthmartOrderResponse: HealthMartOrderResponsePayload = {
  healthMartId: "123456",
  healthMartProduct: "Painkiller",
  healthMartQuantity: 3,
  healthMartCustomerInfo: {
    healthMartCustName: "Tester01",
    healthMartCustAddress: "Testing Address.",
    healthMartCustCity: "Toronto",
    healthMartCustState: "ON",
    healthMartCustZipcode: "A0A0A0",
    healthMartCustCountry: "Canada",
  },
};
