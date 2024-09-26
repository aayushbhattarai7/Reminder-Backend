import { type Request, type Response } from "express";
import adminService from "../service/admin.service";
import { AdminDTO } from "../dto/admin.dto";
import { StatusCodes } from "../constant/StatusCodes";
import HttpException from "../utils/HttpException.utils";
export class AdminController {
  async createAdmin(req: Request, res: Response) {
    try {
      const data = await adminService.createAdmin(req.body as AdminDTO);
      res.status(StatusCodes.SUCCESS).json({ data });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("🚀 ~ AuthController ~ create ~ error:", error?.message);
        res.status(StatusCodes.BAD_REQUEST).json({
          message: error?.message,
        });
      } else {
        throw HttpException.internalServerError;
      }
    }
  }
}
