import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import Joi from "joi";
import log4js from "../../config/logger/log4js.js";
import { AppError } from "../../models/error/app-error.js";
import { GenericResponseDto } from "../../models/dto/generic-response.dto.js";

// centralized middleware to handle error thrown
const errorResponseHandlerMiddleware: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const logger = log4js.getLogger();

  logger.error(`Error occurred - ${req.method} request for ${req.url}
  Headers: ${JSON.stringify(req.headers)}
  Query: ${JSON.stringify(req.query)}
  Body: ${JSON.stringify(req.body)}
  Error: ${err}
  Error (as JSON): ${JSON.stringify(err)}
  `);

  if (err instanceof AppError) {
    // handle custom app error
    res.status(err.statusCode).send(
      new GenericResponseDto({
        isSuccess: false,
        errorCode: err.errorCode,
        errorMsg: err.message,
      })
    );
  } else if (err instanceof Joi.ValidationError) {
    // handle ValidationError from joi
    res.status(400).send(
      new GenericResponseDto({
        isSuccess: false,
        errorCode: "VALIDATION_ERROR",
        errorMsg: JSON.stringify(err.details),
      })
    );
  } else {
    // handle other unhandled error
    res.status(500).send(
      new GenericResponseDto({
        isSuccess: false,
        errorCode: "INTERNAL_SERVER_ERROR",
      })
    );
  }
};

export default errorResponseHandlerMiddleware;
