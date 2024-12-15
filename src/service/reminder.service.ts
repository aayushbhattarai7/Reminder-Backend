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
console.log('ohhh')
        await this.notiRepo.save(notification);
        const tasks = await userService.getNotification(userId);
        io.to(userId).emit("notification", { tasks });
        const email = 'np05cp4a220031@iic.edu.np'
        await mailService.sendMail({
          to: user.email,
          text: "Reminder",
          subject: `Reminder: Task ${task.name}`,
          html: ` <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f9;
          color: #333;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          background: #ffffff;
          border: 1px solid #ddd;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 10px 0;
          border-bottom: 1px solid #ddd;
        }
        .header h1 {
          color: #5a67d8;
          font-size: 24px;
          margin: 0;
        }
        .content {
          margin-top: 20px;
        }
        .content p {
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          margin-top: 20px;
          color: #888;
        }
        .footer a {
          color: #5a67d8;
          text-decoration: none;
        }
        .btn {
          display: inline-block;
          padding: 10px 15px;
          background-color: #5a67d8;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          font-size: 16px;
        }
        .btn:hover {
          background-color: #434dbd;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Milestone Submission Reminder</h1>
        </div>
        <div class="content">
          <p>Dear ${email},</p>
          <p>This is a gentle reminder to submit your milestone by <strong>1:00 AM today</strong>. Please ensure your submission is on time, as late submissions will lead to a deduction in marks.</p>
          <p>If you have any questions or need assistance, please do not hesitate to contact your instructor.</p>
          <p>Best Regards,<br>Your Second Teacher</p>
        </div>
        <div class="footer">
          <p>If you have any questions, reach out to us at <a href="mailto:teacher@school.com">teacher@school.com</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `,
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
