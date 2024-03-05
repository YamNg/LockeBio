import { Request, Response, NextFunction } from "express";
import log4js from "../../config/logger/log4js.js";

// centralized middleware for logging log when receiving request
const requestLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const logger = log4js.getLogger();
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
};

export default requestLoggerMiddleware;
