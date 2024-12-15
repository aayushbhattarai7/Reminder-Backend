import UserService from "../service/user.service";
import { StatusCodes } from "../constant/StatusCodes";
import { type Request, type Response } from "express";
import { UserDTO } from "../dto/user.dto";
import webTokenService from "../service/webToken.service";
import ReminderService from "../service/reminder.service";
import HttpException from "../utils/HttpException.utils";
const userService = new UserService();
// const reminderService = new ReminderService();
export class UserController {
  async create(req: Request, res: Response) {
    console.log("jahhdf")
    try {
      console.log(req.body,"jaja")
      const data = await userService.signup(req.body as UserDTO);
      res.status(StatusCodes.SUCCESS).json({ data });
    } catch (error: any) {
      console.log("🚀 ~ AuthController ~ create ~ error:", error?.message);
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error?.message,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = await userService.login(req.body as UserDTO);
      const tokens = webTokenService.generateTokens(
        {
          id: data.id,
        },
        data.role,
      );
      res.status(StatusCodes.SUCCESS).json({
        data: {
          id: data.id,
          name: data.name,
          DOB: data.DOB,
          email: data.email,

          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          },
          message: "LoggedIn successfully",
        },
      });
    } catch (error: any) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error?.message,
      });
    }
  }

  // async checkBirthdays(req: Request, res: Response) {
  //   try {
  //     const userId = req.user?.id;
  //     const data = await reminderService.checkBirthdays(userId as string);
  //     res.status(StatusCodes.SUCCESS).json({
  //       data,
  //     });
  //   } catch (error) {
  //     res.status(StatusCodes.BAD_REQUEST).send("error");
  //   }
  // }

  async getUserTask(req: Request, res: Response) {
    try {
      const user_id = req.user?.id;
      const data = await userService.getUserTask(user_id as string);
      res.status(StatusCodes.SUCCESS).json({
        data,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(StatusCodes.BAD_REQUEST).json(error.message);
      } else {
        res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Internal Server Error" });
      }
    }
  }

  async notification(req: Request, res: Response) {
    try {
      const user_id = req.user?.id;

      const data = await userService.getNotification(user_id as string);
      res.status(StatusCodes.SUCCESS).json({ data });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("🚀 ~ taskcontroller  ~ error:", error?.message);
        res.status(StatusCodes.BAD_REQUEST).json({
          message: error?.message,
        });
      } else {
        throw HttpException.internalServerError;
      }
    }
  }

  // async completeTask(req: Request, res: Response) {
  //   try {
  //     const user_id = req.user?.id;
  //     const task_id = req.params.id;
  //     const data = await userService.completeTask(task_id, user_id as string);
  //     res
  //       .status(StatusCodes.SUCCESS)
  //       .json({ data, message: "Task submitted successfully" });
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       res.status(StatusCodes.BAD_REQUEST).json({
  //         message: error?.message,
  //       });
  //     } else {
  //       throw HttpException.internalServerError;
  //     }
  //   }
  // }
}
