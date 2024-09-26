import { Admin } from "../entities/admin.entity";
import { AppDataSource } from "../config/database.config";
import { AdminDTO } from "../dto/admin.dto";
import HttpException from "../utils/HttpException.utils";
import BcryptService from "./bcrypt.service";
const bcryptService = new BcryptService();
class AdminService {
  constructor(
    private readonly adminrepo = AppDataSource.getRepository(Admin),
  ) {}

  async createAdmin(data: AdminDTO): Promise<Admin> {
    try {
      const emailExist = await this.adminrepo.findOneBy({ email: data.email });
      if (emailExist)
        throw HttpException.notFound("Entered Email is not registered yet");

      const hashPassword = await bcryptService.hash(data.password);
      const addAdmin = this.adminrepo.create({
        name: data.name,
        email: data.email,
        password: hashPassword,
      });
      await this.adminrepo.save(addAdmin);
      return addAdmin;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw HttpException.badRequest(error?.message);
      } else {
        throw HttpException.internalServerError;
      }
    }
  }
    
    async loginAdmin(data:AdminDTO):Promise<Admin> {
        try {
            const admin = await this.adminrepo.findOne({
                where: [{ email: data.email }],
                select:['id','email','password']
            })
            if (!admin) throw HttpException.notFound('Invalid Email')
            const checkPassword = await bcryptService.compare(data.password, admin.password)
            if (!checkPassword) throw HttpException.badRequest('Password didnot matched')
            return admin
        } catch (error: unknown) {
      if (error instanceof Error) {
              throw HttpException.badRequest(error.message);

      } else {
        throw HttpException.internalServerError
      }
    }
    }
}

export default new AdminService();
