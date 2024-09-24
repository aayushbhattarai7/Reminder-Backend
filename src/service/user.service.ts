import { UserDTO } from "../dto/user.dto";
import { AppDataSource } from "../config/database.config";
import { User } from "../entities/user.entity";
import BcryptService from "./bcrypt.service";
import { MailService } from "./mail.service";
import schedule from 'node-schedule'
const bcryptService = new BcryptService()
const mailService = new MailService()

class UserService {
    constructor(
        private readonly userRepo = AppDataSource.getRepository(User)
    ) { }
    
    async signup(data:UserDTO) {
        try {
            const emailExist = await this.userRepo.findOneBy({ email: data.email })
            if (emailExist) throw new Error('Email is already registered')
            
            const hashPassword = await bcryptService.hash(data.password)
            const addUser = this.userRepo.create({
                name: data.name,
                DOB:data.DOB,
                email: data.email,
                password:hashPassword
            })
            await this.userRepo.save(addUser)
             await mailService.sendMail({
                    to: addUser.email,
                    text: `Hello ${addUser.name}`,
                    subject: 'Greeting of the day',
                    html:`<p>Hey ${addUser.name}, We hope your day gone well ${addUser.DOB}`
                })
            return addUser
        } catch (error:unknown) {
            if (error instanceof Error) {
                throw new Error(error?.message)
            }
            else {
                throw new Error('Internal Server Error')
            }
        }
    }

   async wishUserBirthday() {
        try {
            const users = await this.userRepo.find();
            if (!users.length) throw new Error('No users found');

            users.forEach(user => {
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
                     schedule.scheduleJob(dob, async () => {
                    await mailService.sendMail({
                        to: user.email,
                        text: `Hello ${user.name}`,
                        subject: 'Greeting of the day',
                        html: `<p>Hey ${user.name}, Happy Birthday!</p>`
                    });
                    console.log(`Birthday email sent to ${user.name}`);

                });
                } else {
                    return
                }
                return `Happy Birthday ${user.name}`
            });
            
        } catch (error: any) {
            throw new Error(error?.message);
        }
    }

}

export default UserService
/** const userBirthday = await this.userRepo.createQueryBuilder('user')
                .where('EXTRACT(MONTH FROM user.DOB) =:currentMonth', { currentMonth })
                .andWhere("EXTRACT(DAY FROM user.DOB) =:currentDay", { currentDay })
            .getMany()
            for (const user of userBirthday) {
} */