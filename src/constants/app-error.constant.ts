// Constant defining types of errors

export interface AppErrorConstant {
  statusCode: number;
  errorCode: string;
  message: string;
}

/* Database related error */
export const DbOperationFailure: AppErrorConstant = {
  statusCode: 500,
  errorCode: "DATABASE_OPERATION_FAILURE",
  message: "Database failed to execute operation",
};

export const EntityNotFound: AppErrorConstant = {
  statusCode: 404,
  errorCode: "ENTITY_NOT_FOUND",
  message: "Entity not found",
};

export const EntityAlreadyExists: AppErrorConstant = {
  statusCode: 400,
  errorCode: "ENTITY_ALREADY_EXISTS",
  message: "Entity already exists",
};

export const ExternalApiRequestFailure: AppErrorConstant = {
  statusCode: 500,
  errorCode: "EXTERNAL_API_REQ_FAILURE",
  message: "System failed to request external api",
};

/* Pharmacy service related error */
export const PharmacyNotFound: AppErrorConstant = {
  statusCode: 400,
  errorCode: "PHARMACY_NOT_FOUND",
  message: "Pharmacy not found",
};

export const PharmacyProductNotFound: AppErrorConstant = {
  statusCode: 400,
  errorCode: "PHARMACY_PRODUCT_NOT_FOUND",
  message: "Pharmacy Product not found",
};

/* Order service related error */
export const OrderNotFound: AppErrorConstant = {
  statusCode: 400,
  errorCode: "ORDER_NOT_FOUND",
  message: "Order not found",
};

export const OrderPharmacyNotFound: AppErrorConstant = {
  statusCode: 400,
  errorCode: "ORDER_PHARMACY_NOT_FOUND",
  message: "Order Pharmacy not found",
};

export const OrderPharmacyProductNotFound: AppErrorConstant = {
  statusCode: 400,
  errorCode: "ORDER_PHARMACY_PRODUCT_NOT_FOUND",
  message: "Order Pharmacy Product not found",
};

export const UnsupportedOrderHandler: AppErrorConstant = {
  statusCode: 400,
  errorCode: "UNSUPPORTED_ORDER_HANDLER",
  message: "Unsupported Order Handler",
};

export const orderHandlerApiConfigNotFound: AppErrorConstant = {
  statusCode: 500,
  errorCode: "ORDER_HANDLER_API_CONFIG_NOT_FOUND",
  message: "Order Handler Api Configuration Not Found",
};
