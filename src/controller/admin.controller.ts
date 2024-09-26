import { type Request, type Response } from "express";
import adminService from "../service/admin.service";
import { AdminDTO } from "../dto/admin.dto";
import { StatusCodes } from "../constant/StatusCodes";
import HttpException from "../utils/HttpException.utils";
import webTokenService from "../service/webToken.service";
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
    async loginAdmin(req: Request, res: Response) {
        try {
            const data = await adminService.loginAdmin(req.body as AdminDTO);
            const tokens = webTokenService.generateTokens({
                id: data.id,
            },data.role
            )
            res.status(StatusCodes.SUCCESS).json({
                data: {
                    id: data.id,
                    name: data.name,
                email: data.email,
                    role:data.role,
                    tokens: {
                        accessToken: tokens.accessToken,
                        refreshToken:tokens.refreshToken
                    },message:'LoggedIn Successfully'
                }
            })
        }  catch (error: any) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error?.message,
      });
    }
    }
}
