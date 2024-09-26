import { AdminController } from "../controller/admin.controller";
import { Router } from "express";
const adminController = new AdminController()
const router: Router = Router()
router.post('/signup', adminController.createAdmin)

export default router