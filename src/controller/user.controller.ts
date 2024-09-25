import UserService from "../service/user.service"
import { StatusCodes } from "../constant/StatusCodes"
import { type Request, type Response } from "express"
import { UserDTO } from "../dto/user.dto"
import webTokenService from "../service/webToken.service"
import HttpException from "../utils/HttpException.utils"
import ReminderService from "../service/reminder.service"
const userService = new UserService()
const reminderService = new ReminderService()
export class UserController {
    async create(req: Request, res: Response) {
        try {
            const data = await userService.signup(req.body as UserDTO)
            res.status(StatusCodes.SUCCESS).json({data})
        } catch (error: any) {
            console.log('🚀 ~ AuthController ~ create ~ error:', error?.message)
            res.status(StatusCodes.BAD_REQUEST).json({
                message: error?.message,
            })
        }
    }

    async login(req: Request, res: Response) {
        try {
            console.log(req.body)
            const data = await userService.login(req.body as UserDTO)
        const tokens = webTokenService.generateTokens(
        {
          id: data.id,
        },
        data.role
      )
            res.status(StatusCodes.SUCCESS).json({
                data: {
                     id: data.id,
                    name: data.name,
                    DOB: data.DOB,
                    email: data.email,

                tokens: {
                    accessToken: tokens.accessToken,
                    refreshToken:tokens.refreshToken
                }, message:'LoggedIn successfully'
                }
               
            })
        } catch (error:any) {
            res.status(StatusCodes.BAD_REQUEST).json({
                message: error?.message,
            })        }
    }

    async checkBirthdays(req:Request, res:Response) {
        try {
            const userId = req.user?.id
            const data = await reminderService.checkBirthdays(userId as string)
            res.status(StatusCodes.SUCCESS).json({
                data,
            })
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).send('error')
        }
    }
}
