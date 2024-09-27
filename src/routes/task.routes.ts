import { Router } from "express";
import { authentication } from "../middleware/authentication.middleware";
import { authorization } from "../middleware/authorization.middleware";
import { TaskController } from "../controller/task.controller";
import { Role } from "../constant/enum";
const taskcontroller = new TaskController();
const router: Router = Router();
router.use(authentication());
router.use(authorization([Role.ADMIN]));
router.post("/assign/:id", taskcontroller.assigntask);

export default router;
