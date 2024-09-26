import { type Request, type Response } from "express";
import taskService from "../service/task.service";
import { TaskDTO } from "../dto/task.dto";
import { StatusCodes } from "../constant/StatusCodes";
export class TaskController {
  async assigntask(req: Request, res: Response) {
    console.log(req.body,'hahah');
    try {
      const admin_id = req.user?.id;
      const user_id = req.params.id;

      const data = await taskService.assignTask(
        admin_id as string,
        req.body as TaskDTO,
        user_id,
      );
      res.status(StatusCodes.SUCCESS).json({ data });
    } catch (error: any) {
      console.log("🚀 ~ taskcontroller  ~ error:", error?.message);
      res.status(StatusCodes.BAD_REQUEST).json({
        message: error?.message,
      });
    }
  }

}
