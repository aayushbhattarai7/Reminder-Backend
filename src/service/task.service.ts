import { Task } from "../entities/task.entity";
import { AppDataSource } from "../config/database.config";
import { TaskDTO } from "../dto/task.dto";
import { Admin } from "../entities/admin.entity";
import HttpException from "../utils/HttpException.utils";
import { User } from "../entities/user.entity";
import { Status } from "../constant/enum";

class TaskService {
    constructor(private readonly taskRepo = AppDataSource.getRepository(Task),
      private readonly adminrepo = AppDataSource.getRepository(Admin),
     private readonly userRepo = AppDataSource.getRepository(User)
) { }
    
    async assignTask(admin_id:string,data: TaskDTO, user_id:string) {
        try {
            const admin = await this.adminrepo.findOneBy({ id: admin_id })
            if (!admin) throw HttpException.unauthorized('You are not authorized')
            
          const user = await this.userRepo.findOneBy({ id: user_id })
          if(!user) throw HttpException.notFound('Employee  not found')
            const assignTask = this.taskRepo.create({
                name: data.name,
              deadline: data.deadline,
              status:Status.PENDING,
              admin: admin,
              user:user
            })
            await this.taskRepo.save(assignTask)
            return assignTask
        } catch (error: unknown) {
      if (error instanceof Error) {
        throw HttpException.badRequest(error?.message);
      } else {
        throw HttpException.internalServerError;
      }
    }
    }
  
  
 
}

export default new TaskService()