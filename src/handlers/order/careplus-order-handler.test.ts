import axios from "axios";
import { OrderEntity } from "../../models/entity/order.entity.js";
import { CarePlusOrderResponsePayload } from "../../models/payload/response/careplus-response-payloads.interface.js";
import {
  CarePlusClientInfoRequestPayload,
  CarePlusOrderRequestPayload,
} from "../../models/payload/request/careplus-order-request-payload.js";
import { CarePlusOrderHandler } from "./careplus-order-handler.js";
import { orderHandlerApiConfigNotFound } from "../../constants/app-error.constant.js";

jest.mock("axios");

let mockAxios = jest.mocked(axios);
const mockApiDomain = "mock_api_domain";
let carePlusOrderHandlerWithEmptyDomain = new CarePlusOrderHandler("");
let carePlusOrderHandler = new CarePlusOrderHandler(mockApiDomain);

describe("addOrder", () => {
  it("throw an error if api domain setting cannot be found", async () => {
    axios.post = jest.fn();

    try {
      const result = await carePlusOrderHandlerWithEmptyDomain.addOrder(
        orderEntity
      );
    } catch (error) {
      expect(error).toMatchObject(orderHandlerApiConfigNotFound);
    }

    // should not call api if domain setting not found
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("return CarePlus order id", async () => {
    const carePlusId = "testId";
    axios.post = jest.fn().mockResolvedValue({ data: carePlusApiResponse });

    const result = await carePlusOrderHandler.addOrder(orderEntity);

    // post method call should be called with specific api for related order handler
    expect(axios.post).toHaveBeenCalledWith(
      `${mockApiDomain}/orders`,
      carePlusApiRequest
    );

    // returning the id from external api
    expect(result).toEqual(carePlusApiResponse.carePlusId);
  });
});

describe("retrieveOrderById", () => {
  it("throw an error if api domain setting cannot be found", async () => {
    axios.get = jest.fn();

    try {
      const result =
        await carePlusOrderHandlerWithEmptyDomain.retrieveOrderById(
          carePlusApiResponse.carePlusId
        );
    } catch (error) {
      expect(error).toMatchObject(orderHandlerApiConfigNotFound);
    }

    // should not call api if domain setting not found
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("return CarePlus response payload", async () => {
    axios.get = jest.fn().mockResolvedValue({ data: carePlusApiResponse });

    const result = await carePlusOrderHandler.retrieveOrderById(
      carePlusApiResponse.carePlusId
    );

    // post method call should be called with specific api for related order handler
    expect(axios.get).toHaveBeenCalledWith(
      `${mockApiDomain}/orders/${carePlusApiResponse.carePlusId}`
    );

    // returning whole api response
    expect(result).toEqual(carePlusApiResponse);
  });
});

const orderEntity: OrderEntity = {
  id: "45a0b701aeb5425bab86436947c49933",
  createAt: new Date(),
  updateAt: new Date(),
  isActive: true,
  pharmacy: {
    id: "careplus",
    integrationName: "careplus",
    name: "CarePlus Pharmacy",
    address: "456 Elm St",
    city: "Townsville",
    state: "Stateville",
    zipcode: "67890",
    country: "Countryland",
    fax: "567-890-1234",
    phone: "876-543-2109",
  },
  status: "sent",
  product: {
    id: "648324056f0b42da8157ce1019c85873",
    label: "Antibiotics",
    integrationName: "Antibiotics",
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

const carePlusApiRequest: CarePlusOrderRequestPayload = {
  carePlusProduct: orderEntity.product.integrationName,
  carePlusQuantity: orderEntity.quantity,
  carePlusClientInfo: {
    carePlusClientName: orderEntity.customer.fullName,
    carePlusClientAddress: orderEntity.customer.address,
    carePlusClientCity: orderEntity.customer.city,
    carePlusClientState: orderEntity.customer.state,
    carePlusClientZipcode: orderEntity.customer.zipCode,
    carePlusClientCountry: orderEntity.customer.country,
  },
};

const carePlusApiResponse: CarePlusOrderResponsePayload = {
  carePlusId: "123456",
  carePlusProduct: orderEntity.product.integrationName,
  carePlusQuantity: orderEntity.quantity,
  carePlusClientInfo: {
    carePlusClientName: orderEntity.customer.fullName,
    carePlusClientAddress: orderEntity.customer.address,
    carePlusClientCity: orderEntity.customer.city,
    carePlusClientState: orderEntity.customer.state,
    carePlusClientZipcode: orderEntity.customer.zipCode,
    carePlusClientCountry: orderEntity.customer.country,
  },
};
