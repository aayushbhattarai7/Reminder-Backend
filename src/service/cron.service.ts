// import cron from 'node-cron'
// import ReminderService from './reminder.service'
// import { AppDataSource } from '../config/database.config'
// import { User } from '../entities/user.entity'
// const reminderService = new ReminderService()
// export class CronService{
//     constructor(
//         private readonly userRepo = AppDataSource.getRepository(User)
//     ) { }
//     startjob(){
//         cron.schedule('* * * * *', async () => {
//            try {
//             const users = await this.userRepo.find();
//             if (!users.length) throw new Error('No users found');

//             users.forEach(async user => {
//                 const dob = new Date(user.DOB);
//                 const now = new Date();
//                 dob.setFullYear(now.getFullYear());

//                 if (now > dob) {
//                     dob.setFullYear(now.getFullYear());
//                 }
//                  const today = new Date();
//                     const currentMonth = today.getMonth() + 1;
//                     const currentDay = today.getDate();

//                     const userDOB = new Date(user.DOB); 
//                         const userBirthMonth = userDOB.getMonth() + 1;
//                     const userBirthDay = userDOB.getDate();
//                 if (currentMonth === userBirthMonth && currentDay === userBirthDay) {
//                        await reminderService.sendNotification()

//                 } else {
//                     return
//                 }
//                 return `Happy Birthday ${user.name}`
//             });
            
//         } catch (error: any) {
//             throw new Error(error?.message);
//         }
           
// })
// }
// }

