import { type NextFunction, type Request, type Response } from "express";
import { DotenvConfig } from "../config/env.config";
import tokenService from "../service/webToken.service";
export const authentication = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const tokens = req.headers.authorization?.split(" ");
    try {
      if (!tokens) {
        throw new Error("You are not authorized");
      }
      const mode = tokens[0];
      const accessToken = tokens[1];

      if (mode != "Bearer" || !accessToken)
        throw new Error("You are not authorized");
      const payload = tokenService.verify(
        accessToken,
        DotenvConfig.ACCESS_TOKEN_SECRET,
      );
      if (payload) {
        req.user = payload;
        next();
      } else {
        throw new Error("You are not authorized");
      }
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new Error("Token Expired, Please sign in again");
      }
      return next(new Error("You are not authorized"));
    }
  };
};
