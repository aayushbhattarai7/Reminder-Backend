import { Task } from "../entities/task.entity";
import { AppDataSource } from "../config/database.config";
import { TaskDTO } from "../dto/task.dto";
import { Admin } from "../entities/admin.entity";
import HttpException from "../utils/HttpException.utils";
import { User } from "../entities/user.entity";
import { Status } from "../constant/enum";
import { Notification } from "../entities/notification.entity";

class TaskService {
  constructor(
    private readonly taskRepo = AppDataSource.getRepository(Task),
    private readonly adminRepo = AppDataSource.getRepository(Admin),
    private readonly userRepo = AppDataSource.getRepository(User),
    private readonly notiRepo = AppDataSource.getRepository(Notification),
  ) {}

  async assignTask(admin_id: string, data: TaskDTO, user_id: string) {
    try {
      const admin = await this.adminRepo.findOneBy({ id: admin_id });
      if (!admin) throw HttpException.unauthorized("You are not authorized");

      const user = await this.userRepo.findOneBy({ id: user_id });
      if (!user) throw HttpException.notFound("Employee not found");

      const assignTask = this.taskRepo.create({
        name: data.name,
        deadline: data.deadline,
        status: Status.PENDING,
        admin: admin,
        user: user,
      });

      await this.taskRepo.save(assignTask);
      const notification = this.notiRepo.create({
        notification: "You have got new task",
        auth: user,
      });
      await this.notiRepo.save(notification);
      return assignTask;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw HttpException.badRequest(error?.message);
      } else {
        throw HttpException.internalServerError;
      }
    }
  }

 
}

export default new TaskService();
