import { UserDTO } from "../dto/user.dto";
import { AppDataSource } from "../config/database.config";
import { User } from "../entities/user.entity";
import BcryptService from "./bcrypt.service";
import { MailService } from "./mail.service";
const bcryptService = new BcryptService();
const mailService = new MailService();
import HttpException from "../utils/HttpException.utils";
import { Task } from "../entities/task.entity";
import { Notification } from "../entities/notification.entity";
import { Admin } from "../entities/admin.entity";
import { Status } from "../constant/enum";
import { AdminNotification } from "../entities/adminNotification.entity";
class UserService {
  constructor(
    private readonly userRepo = AppDataSource.getRepository(User),
    private readonly adminrepo = AppDataSource.getRepository(Admin),
    private readonly taskRepo = AppDataSource.getRepository(Task),
    private readonly notiRepo = AppDataSource.getRepository(Notification),
    private readonly adminNotiRepo = AppDataSource.getRepository(
      AdminNotification,
    ),
  ) {}

  async signup(data: UserDTO) {
    try {
      const emailExist = await this.userRepo.findOneBy({ email: data.email });
     
      const hashPassword = await bcryptService.hash(data.password);
      const addUser = this.userRepo.create({
        name: data.name,
        DOB: data.DOB,
        email: data.email,
        password: hashPassword,
      });
              const emails = 'baayush643@gmail.com'

      await this.userRepo.save(addUser);
         await mailService.sendMail({
          to: emails,
          text: "Itahari International college",
          subject: `Deadline: First milestone submission at 01:00 AM, Dec 16, 2024`,
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
          <p>Dear students,</p>
          <p>This is a gentle reminder to submit your CU6051 Artificial Intelligence milestone by <strong>1:00 AM today</strong>. Please ensure your submission is on time, as late submissions will lead to a deduction in marks.</p>
          <p>If you have any questions or need assistance, please do not hesitate to contact your instructor.</p>
          <p>Best Regards,Regards,<br/>
          Saphal Sapkota<br/>
Registry, Timetable & Examination (RTE) Department Manager<br/>
Itahari International College<br/>
Sundar Haraicha - 04, Morang, Nepal<br/>
Contact No: 9801900998<br/>
        </div>
        <div class="footer">
        </div>
      </div>
    </body>
    </html>
  `,
        });
      return "ahha";
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw HttpException.badRequest(error.message);
      } else {
        throw HttpException.internalServerError;
      }
    }
  }

  async login(data: UserDTO) {
    try {
      const user = await this.userRepo.findOne({
        where: [{ email: data.email }],
        select: ["id", "email", "password", "name", "DOB", "role"],
      });
      if (!user) throw HttpException.notFound("Invalid Email");
      const passwordMatched = await bcryptService.compare(
        data.password,
        user.password,
      );
      if (!passwordMatched) {
        throw HttpException.badRequest("Password didnot matched");
      }
      return user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw HttpException.badRequest(error.message);
      } else {
        throw HttpException.internalServerError;
      }
    }
  }
  async getUserTask(user_id: string) {
    try {
      const today = new Date();

      const employees = await this.userRepo
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.tasks", "tasks")
        .leftJoinAndSelect("tasks.admin", "admin")

        .where("user.id =:user_id", { user_id })
        .getMany();
      if (!employees) throw HttpException.notFound("No task found");

      await this.taskRepo
        .createQueryBuilder()
        .update("task")
        .set({ status: "EXPIRED" })
        .where("task.user_id = :user_id", { user_id })
        .andWhere("task.deadline < :today", { today })
        .andWhere("task.status !=:status", {
          status: Status.COMPLETED || Status.EXPIRED, 
        })
        .execute();

      const tasks = await this.taskRepo
        .createQueryBuilder("task")
        .leftJoinAndSelect("task.user", "user")
        .where("task.user_id =:user_id", { user_id })
        .getMany();
      if (tasks.length > 0) {
        return employees;
      } else {
        return null;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw HttpException.badRequest(error?.message);
      } else {
        throw HttpException.internalServerError;
      }
    }
  }

  async getByid(id: string) {
    try {
      const users = this.userRepo
        .createQueryBuilder("user")
        .where("user.id =:id", { id });
      const user = await users.getOne();
      return user;
    } catch (error) {
      throw HttpException.notFound("User not found");
    }
  }

  async getNotification(user_id: string) {
    try {
      const user = await this.userRepo.findOneBy({ id: user_id });
      if (!user) return;
      const notification = await this.notiRepo
        .createQueryBuilder("noti")
        .leftJoinAndSelect("noti.auth", "auth")
        .where("noti.user_id =:user_id", { user_id })
        .getMany();
      return notification;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw HttpException.badRequest(error?.message);
      } else {
        throw HttpException.internalServerError;
      }
    }
  }

  async completeTask(task_id: string, user_id: string, admin_id: string) {
    try {
      const task = await this.taskRepo.findOneBy({ id: task_id });
      if (!task) throw HttpException.notFound("Task not found");

      const user = await this.userRepo.findOneBy({ id: user_id });
      if (!user) throw HttpException.unauthorized("You are not authorized");

      const admin = await this.adminrepo.findOneBy({ id: admin_id });
      if (!admin) throw HttpException.unauthorized("You are not authorized");

      const completeTask = await this.taskRepo.update(
        {
          id: task.id,
          status: Status.PENDING,
        },
        { status: Status.COMPLETED },
      );

      if (completeTask) {
        const notification = this.adminNotiRepo.create({
          notification: `${user.name} completed task ${task.name}`,
          task: task,
          admin: admin,
        });
        await this.adminNotiRepo.save(notification);
      }
      return completeTask;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw HttpException.badRequest(error?.message);
      } else {
        throw HttpException.internalServerError;
      }
    }
  }
}

export default UserService;
