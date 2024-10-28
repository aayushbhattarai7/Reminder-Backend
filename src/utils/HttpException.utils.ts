



  static forbidden(message: string): HttpException {
    return new HttpException(message, StatusCodes.FORBIDDEN);
  }

  static internalServerError(message: string): HttpException {
    return new HttpException(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export default HttpException;
