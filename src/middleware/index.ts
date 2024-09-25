import express, { Request, Response, Application, NextFunction } from "express";
import cors from "cors";
import { DotenvConfig } from "../config/env.config";
import { StatusCodes } from "../constant/StatusCodes";
import routes from "../routes/index.routes";
import bodyParser from "body-parser";
import { errorHandler } from "./errorhandler.middleware";

const middleware = (app: Application) => {
  app.use(
    cors({
      origin: "*",
    }),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.headers["user-agent"];
    const apikey = req.headers["apikey"];
    if (userAgent && userAgent.includes("Mozilla")) {
      next();
    } else {
      if (apikey === DotenvConfig.API_KEY) next();
      else res.status(StatusCodes.FORBIDDEN).send("Forbidden");
    }
  });

  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: false }));
  app.use("/api", routes);
  app.use(errorHandler);
};

export default middleware;
