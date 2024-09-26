import { AdminController } from "../controller/admin.controller";
import { Router } from "express";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { Role } from "../constant/enum";
const adminController = new AdminController();
const router: Router = Router();
router.post("/signup", adminController.createAdmin);
router.post("/login", adminController.loginAdmin);
router.use(authentication());
router.use(authorization([Role.ADMIN]));
router.get("/employee", adminController.getAllEmployee);

export default router;
