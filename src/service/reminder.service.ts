import { User } from "../entities/user.entity";
import { AppDataSource } from "../config/database.config";
import { MailService } from "./mail.service";
import cron from "node-cron";
import UserService from "./user.service";
const mailService = new MailService();
const userService = new UserService();
class ReminderService {
  constructor(private readonly userRepo = AppDataSource.getRepository(User)) {}

  async startjob() {
    cron.schedule("0 0 * * *", async () => {
      try {
        const users = await this.userRepo.find();
        if (!users.length) throw new Error("No users found");

        users.forEach(async (user) => {
          const dob = new Date(user.DOB);
          const now = new Date();
          dob.setFullYear(now.getFullYear());

          if (now > dob) {
            dob.setFullYear(now.getFullYear());
          }
          const today = new Date();
          const currentMonth = today.getMonth() + 1;
          const currentDay = today.getDate();

          const userDOB = new Date(user.DOB);
          const userBirthMonth = userDOB.getMonth() + 1;
          const userBirthDay = userDOB.getDate();
          if (currentMonth === userBirthMonth && currentDay === userBirthDay) {
            await mailService.sendMail({
              to: user.email,
              text: `Hello ${user.name}`,
              subject: "Greeting of the day",
              html: `<p>Hey ${user.name}, Happy Birthday`,
            });
          } else {
            return;
          }
          return `Happy Birthday ${user.name}`;
        });
      } catch (error: any) {
        throw new Error(error?.message);
      }
    });
  }
  async checkBirthdays(userId: string) {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const currentDate = new Date(today.getFullYear(), month - 1, day);

    const usersWithBirthdays = await this.userRepo.findOne({
      where: {
        id: userId,
        DOB: currentDate,
      },
    });
    if (!usersWithBirthdays) {
      await this.userRepo.update({ id: userId }, { wish: null });
    }

    if (usersWithBirthdays) {
      if (!usersWithBirthdays?.wish) {
        await this.userRepo.update(
          { id: userId },
          { wish: `Happy Birthday ${usersWithBirthdays.name}` },
        );
      }
      const data = await userService.getByid(userId);
      return { message: `Happy Birthday ${usersWithBirthdays.name}`, data };
    } else {
      return null;
    }
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
}

export default ReminderService;
