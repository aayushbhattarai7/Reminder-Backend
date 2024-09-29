import { User } from "../entities/user.entity";
import { AppDataSource } from "../config/database.config";
import { MailService } from "./mail.service";
import UserService from "./user.service";
import { Task } from "../entities/task.entity";
import HttpException from "../utils/HttpException.utils";
import { Notification } from "../entities/notification.entity";
import schedule from "node-schedule";
import { io } from "../socket/socket";
const mailService = new MailService();
const userService = new UserService();
class ReminderService {
  constructor(
    private readonly userRepo = AppDataSource.getRepository(User),
    private readonly taskRepo = AppDataSource.getRepository(Task),
    private readonly notiRepo = AppDataSource.getRepository(Notification),
  ) {}
  async dateToCronExpression(date: Date) {
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    return `${seconds} ${minutes} ${hours} ${day} ${month} *`;
  }

  async checkDeadline(userId: string, task_id: string, task_deadline: Date) {
    try {
      const today = new Date();
      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) throw HttpException.notFound("User not found");

      const task = await this.taskRepo.findOneBy({ id: task_id });
      if (!task) throw HttpException.notFound("Task not found");
      const reminderTime = new Date(
        task.deadline.getTime() - 24 * 60 * 60 * 1000,
      );
      schedule.scheduleJob(reminderTime, async () => {
        const notification = this.notiRepo.create({
          notification: `You have just 24 hours left for ${task.name} task submission`,
          auth: user,
          task: task,
          notified: true,
        });

        await this.notiRepo.save(notification);
        const tasks = await userService.getNotification(userId);
        io.to(userId).emit("notification", { tasks });
        await mailService.sendMail({
          to: user.email,
          text: "Reminder",
          subject: `Reminder: Task ${task.name}`,
          html: `<p>Hello ${user.name},</p><p>You have just 24 hours left for ${task.name} task submission.</p>`,
        });
      });
    } catch (error: any) {
      throw HttpException.badRequest(error?.message);
    }
  }

  async checkBirthdays(userId: string) {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) return;
    const task = await this.taskRepo.findOne({
      where: {
        user: user,
      },
    });
    if (!task) {
      throw HttpException.notFound("Task not found");
    }
    const taskDeadlineTimestamp = new Date(task.deadline).getTime();
    const tomorrowStart = new Date(tomorrow).setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow).setHours(23, 59, 59, 999);
    if (
      taskDeadlineTimestamp >= tomorrowStart &&
      taskDeadlineTimestamp <= tomorrowEnd
    ) {
      const notification = this.notiRepo.create({
        notification: "You have just one day left for submission",
      });
      await this.notiRepo.save(notification);
    }
    const data = await userService.getByid(userId);
    return { message: `Happy Birthday`, data };
  }
  async getAllUsers() {
    try {
      const users = await this.userRepo.find();
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Could not fetch users");
    }
  }

  async getTaskByUser(userId: string) {
    try {
      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) return;
      const taskOfUser = await this.taskRepo.findBy({ user: user });
      if (!taskOfUser) return;

      return taskOfUser;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw HttpException.badRequest("Could not fetch task of user");
    }
  }
  async getDeadline(user_id: string) {}
}

export default ReminderService;
