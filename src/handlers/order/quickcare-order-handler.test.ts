import axios from "axios";
import { OrderEntity } from "../../models/entity/order.entity.js";
import { orderHandlerApiConfigNotFound } from "../../constants/app-error.constant.js";
import { QuickCareOrderHandler } from "./quickcare-order-handler.js";
import { QuickCareOrderRequestPayload } from "../../models/payload/request/quickcare-order-request-payload.js";
import { QuickCareOrderResponsePayload } from "../../models/payload/response/quickcare-response-payloads.interface.js";

jest.mock("axios");

let mockAxios = jest.mocked(axios);
const mockApiDomain = "mock_api_domain";
let quickCareOrderHandlerWithEmptyDomain = new QuickCareOrderHandler("");
let quickCareOrderHandler = new QuickCareOrderHandler(mockApiDomain);

describe("addOrder", () => {
  it("throw an error if api domain setting cannot be found", async () => {
    axios.post = jest.fn();

    try {
      const result = await quickCareOrderHandlerWithEmptyDomain.addOrder(
        orderEntity
      );
    } catch (error) {
      expect(error).toMatchObject(orderHandlerApiConfigNotFound);
    }

    // should not call api if domain setting not found
    expect(axios.post).not.toHaveBeenCalled();
  });

  it("return QuickCare order id", async () => {
    axios.post = jest.fn().mockResolvedValue({ data: quickCareApiResponse });

    const result = await quickCareOrderHandler.addOrder(orderEntity);

    // post method call should be called with specific api for related order handler
    expect(axios.post).toHaveBeenCalledWith(
      `${mockApiDomain}/orders`,
      quickCareApiRequest
    );
    // returning the id from external api
    expect(result).toEqual(quickCareApiResponse.quickCareId);
  });
});

describe("retrieveOrderById", () => {
  it("throw an error if api domain setting cannot be found", async () => {
    axios.get = jest.fn();

    try {
      const result =
        await quickCareOrderHandlerWithEmptyDomain.retrieveOrderById(
          quickCareApiResponse.quickCareId
        );
    } catch (error) {
      expect(error).toMatchObject(orderHandlerApiConfigNotFound);
    }

    // should not call api if domain setting not found
    expect(axios.get).not.toHaveBeenCalled();
  });

  it("return QuickCare response payload", async () => {
    axios.get = jest.fn().mockResolvedValue({ data: quickCareApiResponse });

    const result = await quickCareOrderHandler.retrieveOrderById(
      quickCareApiResponse.quickCareId
    );

    // post method call should be called with specific api for related order handler
    expect(axios.get).toHaveBeenCalledWith(
      `${mockApiDomain}/orders/${quickCareApiResponse.quickCareId}`
    );

    // returning whole api response
    expect(result).toEqual(quickCareApiResponse);
  });
});

const orderEntity: OrderEntity = {
  id: "45a0b701aeb5425bab86436947c49933",
  createAt: new Date(),
  updateAt: new Date(),
  isActive: true,
  pharmacy: {
    id: "quickcare",
    integrationName: "quickcare",
    name: "QuickCare Pharmacy",
    address: "789 Oak St",
    city: "Villageville",
    state: "Stateville",
    zipcode: "54321",
    country: "Countryland",
    fax: "345-678-9012",
    phone: "765-432-1098",
  },
  status: "sent",
  product: {
    id: "648324056f0b42da8157ce1019c85873",
    label: "Cold Medicine",
    integrationName: "Cold Medicine",
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

const quickCareApiRequest: QuickCareOrderRequestPayload = {
  quickCareProduct: orderEntity.product.integrationName,
  quickCareQuantity: orderEntity.quantity,
  quickCareUserData: {
    quickCareUserName: orderEntity.customer.fullName,
    quickCareUserAddress: orderEntity.customer.address,
    quickCareUserCity: orderEntity.customer.city,
    quickCareUserState: orderEntity.customer.state,
    quickCareUserZipcode: orderEntity.customer.zipCode,
    quickCareUserCountry: orderEntity.customer.country,
  },
};

const quickCareApiResponse: QuickCareOrderResponsePayload = {
  quickCareId: "123456",
  quickCareProduct: orderEntity.product.integrationName,
  quickCareQuantity: orderEntity.quantity,
  quickCareUserData: {
    quickCareUserName: orderEntity.customer.fullName,
    quickCareUserAddress: orderEntity.customer.address,
    quickCareUserCity: orderEntity.customer.city,
    quickCareUserState: orderEntity.customer.state,
    quickCareUserZipcode: orderEntity.customer.zipCode,
    quickCareUserCountry: orderEntity.customer.country,
  },
};
