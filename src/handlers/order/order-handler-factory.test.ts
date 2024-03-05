import { UnsupportedOrderHandler } from "../../constants/app-error.constant.js";
import { pharmacyIntegrationName } from "../../constants/pharmacy.constant.js";
import { CarePlusOrderHandler } from "./careplus-order-handler.js";
import { HealthMartOrderHandler } from "./healthmart-order-handler.js";
import { getOrderHandler } from "./order-handler-factory.js";
import { QuickCareOrderHandler } from "./quickcare-order-handler.js";

afterEach(() => {
  jest.clearAllMocks();
});

describe("getOrderHandler", () => {
  it("throws an error if pharmacyName was not defined in switch case", () => {
    try {
      getOrderHandler("unknownPharmacyKey");
    } catch (error) {
      expect(error).toMatchObject(UnsupportedOrderHandler);
    }
  });

  it("return HealthMart order handler", () => {
    const orderHandler = getOrderHandler(pharmacyIntegrationName.HEALTHMART);
    expect(orderHandler).toBeInstanceOf(HealthMartOrderHandler);
  });

  it("return CarePlus order handler", () => {
    const orderHandler = getOrderHandler(pharmacyIntegrationName.CAREPLUS);
    expect(orderHandler).toBeInstanceOf(CarePlusOrderHandler);
  });

  it("return QuickCare order handler", () => {
    const orderHandler = getOrderHandler(pharmacyIntegrationName.QUICKCARE);
    expect(orderHandler).toBeInstanceOf(QuickCareOrderHandler);
  });
});
