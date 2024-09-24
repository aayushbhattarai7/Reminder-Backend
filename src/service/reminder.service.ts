import { User } from "../entities/user.entity";
import { AppDataSource } from "../config/database.config";
import { MailService } from "./mail.service";
import cron from 'node-cron'
const mailService = new MailService()
class ReminderService {
    constructor(
        private readonly userRepo = AppDataSource.getRepository(User)
    ) { }

        startjob(){
        cron.schedule('* * * * *', async () => {
           try {
            const users = await this.userRepo.find();
            if (!users.length) throw new Error('No users found');

            users.forEach(async user => {
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
                    console.log('happy Birthday')
await mailService.sendMail({
                    to: user.email,
                    text: `Hello ${user.name}`,
                    subject: 'Greeting of the day',
                    html:`<p>Hey ${user.name}, Happy Birthday`
                })
                } else {
                    return
                }
                return `Happy Birthday ${user.name}`m 
            });
            
        } catch (error: any) {
            throw new Error(error?.message);
        }
           
})
}
    }
    
// }
export default ReminderService