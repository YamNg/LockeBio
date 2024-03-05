import express from "express";
import "dotenv/config";
import routes from "./routes/index.routes.js";
import log4js from "./config/logger/log4js.js";
import requestLoggerMiddleware from "./utils/middlewares/request-logger.middleware.js";
import errorResponseHandlerMiddleware from "./utils/middlewares/error-response-handler.middleware.js";
import initDatabase from "./utils/init-database.util.js";

const app = express();
const logger = log4js.getLogger();

// Middlewares
app.use(express.json());
app.use(requestLoggerMiddleware);
app.use("/", routes);
app.use(errorResponseHandlerMiddleware);

const port = process.env.PORT || 3000;

try {
  // initiate default database for pharmacy from external /pharmacy api
  await initDatabase();

  app.listen(port, () => {
    logger.debug(`server is running on port ${port}`);
  });
} catch (err) {
  logger.error(`server startup failed`, err);
  throw err;
}
