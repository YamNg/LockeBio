import { OrderEntity } from "../../models/entity/order.entity.js";

// interface class for signature of OrderHandler
export interface OrderHandler {
  addOrder(entity: OrderEntity): Promise<string>;
  retrieveOrderById(orderIntegrationId: string): Promise<any>;
}
