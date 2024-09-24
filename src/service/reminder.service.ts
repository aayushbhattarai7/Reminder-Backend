import { User } from "../entities/user.entity";
import { AppDataSource } from "../config/database.config";
import { MailService } from "./mail.service";
const mailService = new MailService()
class ReminderService {
    constructor(
        private readonly userRepo = AppDataSource.getRepository(User)
    ) { }

    async sendNotification(){
        try {
            const user = await this.userRepo.find()
            if (!user) throw new Error('User not found')
            user.map(async(user) => {
                await mailService.sendMail({
                    to: user.email,
                    text: `Hello ${user.name}`,
                    subject: 'Greeting of the day',
                    html:`<p>Hey ${user.name}, Happy Birthday`
                })
            })
            return user
        } catch (error:unknown) {
            if (error instanceof Error) {
                throw new Error(error?.message)
            } else {
                throw new Error('Internal Server Error')
            }
        }
    }
    
}
export default ReminderService