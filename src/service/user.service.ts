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
      if (emailExist)
        throw HttpException.notFound("Entered Email is not registered yet");

      const hashPassword = await bcryptService.hash(data.password);
      const addUser = this.userRepo.create({
        name: data.name,
        DOB: data.DOB,
        email: data.email,
        password: hashPassword,
      });
      await this.userRepo.save(addUser);
      await mailService.sendMail({
        to: addUser.email,
        text: `Hello ${addUser.name}`,
        subject: "Registered Successfully",
        html: `<p>Hey ${addUser.name}, You are successfully registered to our app, Thank you for being the family!`,
      });
      return addUser;
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
