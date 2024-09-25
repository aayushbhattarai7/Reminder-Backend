import { UserDTO } from "../dto/user.dto";
import { AppDataSource } from "../config/database.config";
import { User } from "../entities/user.entity";
import BcryptService from "./bcrypt.service";
import { MailService } from "./mail.service";
const bcryptService = new BcryptService();
const mailService = new MailService();
import HttpException from "../utils/HttpException.utils";

class UserService {
  constructor(private readonly userRepo = AppDataSource.getRepository(User)) {}

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
        subject: "Greeting of the day",
        html: `<p>Hey ${addUser.name}, We hope your day gone well ${addUser.DOB}`,
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
    } catch (error: any) {
      throw HttpException.badRequest(error.message);
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
}

export default UserService;
