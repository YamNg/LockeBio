import axios from "axios";
import { OrderEntity } from "../../models/entity/order.entity.js";
import { orderHandlerApiConfigNotFound } from "../../constants/app-error.constant.js";
import { HealthMartOrderHandler } from "./healthmart-order-handler.js";
import { HealthMartOrderRequestPayload } from "../../models/payload/request/healthmart-order-request-payload.js";
import { HealthMartOrderResponsePayload } from "../../models/payload/response/healthmart-response-payloads.interface.js";

jest.mock("axios");

let mockAxios = jest.mocked(axios);
const mockApiDomain = "mock_api_domain";
let healthMartOrderHandlerWithEmptyDomain = new HealthMartOrderHandler("");
let healthMartOrderHandler = new HealthMartOrderHandler(mockApiDomain);

describe("addOrder", () => {
  it("throw an error if api domain setting cannot be found", async () => {
    axios.post = jest.fn();

    try {
      const result = await healthMartOrderHandlerWithEmptyDomain.addOrder(
        orderEntity
      );
    } catch (error) {
      expect(error).toMatchObject(orderHandlerApiConfigNotFound);
    }

    // should not call api if domain setting not found
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("return HealthMart order id", async () => {
    axios.post = jest.fn().mockResolvedValue({ data: healthMartApiResponse });

    const result = await healthMartOrderHandler.addOrder(orderEntity);

    // post method call should be called with specific api for related order handler
    expect(axios.post).toHaveBeenCalledWith(
      `${mockApiDomain}/orders`,
      healthMartApiRequest
    );
    // returning the id from external api
    expect(result).toEqual(healthMartApiResponse.healthMartId);
  });
});

describe("retrieveOrderById", () => {
  it("throw an error if api domain setting cannot be found", async () => {
    axios.get = jest.fn();

    try {
      const result =
        await healthMartOrderHandlerWithEmptyDomain.retrieveOrderById(
          healthMartApiResponse.healthMartId
        );
    } catch (error) {
      expect(error).toMatchObject(orderHandlerApiConfigNotFound);
    }

    // should not call api if domain setting not found
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("return HealthMart response payload", async () => {
    axios.get = jest.fn().mockResolvedValue({ data: healthMartApiResponse });

    const result = await healthMartOrderHandler.retrieveOrderById(
      healthMartApiResponse.healthMartId
    );

    // post method call should be called with specific api for related order handler
    expect(axios.get).toHaveBeenCalledWith(
      `${mockApiDomain}/orders/${healthMartApiResponse.healthMartId}`
    );

    // returning whole api response
    expect(result).toEqual(healthMartApiResponse);
  });
});

const orderEntity: OrderEntity = {
  id: "45a0b701aeb5425bab86436947c49933",
  createAt: new Date(),
  updateAt: new Date(),
  isActive: true,
  pharmacy: {
    id: "healthMart",
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
    label: "Painkiller",
    integrationName: "Painkiller",
  },
  quantity: 10,
  customer: {
    fullName: "Tester01",
    address: "Testing Address.",
    city: "Toronto",
    state: "ON",
    zipCode: "A0A0A0",
    country: "Canada",
  },
};

const healthMartApiRequest: HealthMartOrderRequestPayload = {
  healthMartProduct: orderEntity.product.integrationName,
  healthMartQuantity: orderEntity.quantity,
  healthMartCustomerInfo: {
    healthMartCustName: orderEntity.customer.fullName,
    healthMartCustAddress: orderEntity.customer.address,
    healthMartCustCity: orderEntity.customer.city,
    healthMartCustState: orderEntity.customer.state,
    healthMartCustZipcode: orderEntity.customer.zipCode,
    healthMartCustCountry: orderEntity.customer.country,
  },
};

const healthMartApiResponse: HealthMartOrderResponsePayload = {
  healthMartId: "123456",
  healthMartProduct: orderEntity.product.integrationName,
  healthMartQuantity: orderEntity.quantity,
  healthMartCustomerInfo: {
    healthMartCustName: orderEntity.customer.fullName,
    healthMartCustAddress: orderEntity.customer.address,
    healthMartCustCity: orderEntity.customer.city,
    healthMartCustState: orderEntity.customer.state,
    healthMartCustZipcode: orderEntity.customer.zipCode,
    healthMartCustCountry: orderEntity.customer.country,
  },
};
