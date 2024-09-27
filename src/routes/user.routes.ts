import { UserController } from "../controller/user.controller";
import { Router } from "express";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { Role } from "../constant/enum";
const userController = new UserController();

const router: Router = Router();

router.post("/signup", userController.create);
router.post("/login", userController.login);
router.use(authentication());
router.use(authorization([Role.USER]));
// router.get("/birthday", userController.checkBirthdays);
router.get("/task", userController.getUserTask);
router.get("/notification", userController.notification);
router.patch("/complete/:id", userController.completeTask);

export default router;
