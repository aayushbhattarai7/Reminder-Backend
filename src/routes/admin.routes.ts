import { AdminController } from "../controller/admin.controller";
import { Router } from "express";
const adminController = new AdminController()
const router: Router = Router()
router.post('/signup', adminController.createAdmin)
router.post('/login', adminController.loginAdmin)

export default router