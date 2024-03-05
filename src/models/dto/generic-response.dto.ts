// Classes for constructing common response output
interface GenericResponseDtoParams {
  isSuccess: boolean;
  body?: any;
  errorCode?: string;
  errorMsg?: string;
}

enum GenericResponseStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export class GenericResponseDto {
  status: string;
  body?: any;
  errorCode?: string;
  errorMsg?: string;

  constructor(obj: GenericResponseDtoParams) {
    this.status = obj.isSuccess
      ? GenericResponseStatus.SUCCESS
      : GenericResponseStatus.ERROR;
    this.body = obj.body;
    this.errorCode = obj.errorCode;
    this.errorMsg = obj.errorMsg;
  }
}
