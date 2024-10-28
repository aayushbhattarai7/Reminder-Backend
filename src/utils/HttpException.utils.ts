d scrambled it to make a type specimen 
  }

  static internalServerError(message: string): HttpException {
    return new HttpException(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export default HttpException;
