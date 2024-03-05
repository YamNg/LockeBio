import { AppErrorConstant } from "../../constants/app-error.constant.js";

// Custom error class used by the application
export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;

  constructor(appError: AppErrorConstant) {
    super(appError.message);
    this.statusCode = appError.statusCode;
    this.errorCode = appError.errorCode;
  }
}
