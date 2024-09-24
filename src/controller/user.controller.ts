import UserService from "../service/user.service"
import { StatusCodes } from "../constant/StatusCodes"
import { type Request, type Response } from "express"
import { UserDTO } from "../dto/user.dto"
const userService = new UserService()
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
}
