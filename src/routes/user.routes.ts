import { UserController } from '../controller/user.controller'
import { Router } from 'express'
const userController = new UserController()

const router: Router = Router()

router.post('/signup',userController.create)

export default router
