import cron from 'node-cron'
import ReminderService from './reminder.service'
import { AppDataSource } from '../config/database.config'
import { User } from '../entities/user.entity'
const reminderService = new ReminderService()
export class CronService{
    constructor(
        private readonly userRepo = AppDataSource.getRepository(User)
    ) { }
    startjob(){
        cron.schedule('0 0 * * *', async () => {
            const today = new Date()
            const currentMonth = today.getMonth() + 1
            const currentDay = today.getDate()

            const userBirthday = await this.userRepo.createQueryBuilder('user')
                .where('EXTRACT(MONTH FROM user.DOB) =:currentMonth', { currentMonth })
                .andWhere("EXTRACT(DAY FROM user.DOB) =:currentDay", { currentDay })
            .getMany()
            for (const user of userBirthday) {
    await reminderService.sendNotification()
}
})
}
}

