// import { Server } from "socket.io";
// import webTokenService from "../service/webToken.service";
// import { DotenvConfig } from "../config/env.config";
// import ReminderService from "../service/reminder.service";
// import cron from "node-cron";
// import taskService from "../service/task.service";
// import UserService from "../service/user.service";
// import HttpException from "../utils/HttpException.utils";
// import { AppDataSource } from "../config/database.config";
// import { Task } from "../entities/task.entity";

// export class Socket {
//   constructor(server: any) {
//     const io = new Server(server, {
//       cors: {
//         origin: "*",
//       },
//     });

//     io.use((socket, next) => {
//       const socketToken = socket.handshake.auth.token;
//       if (!socketToken) {
//         return next(new Error("You are not authorized"));
//       }
//       try {
//         const auth = webTokenService.verify(
//           socketToken,
//           DotenvConfig.ACCESS_TOKEN_SECRET,
//         );
//         if (auth) {
//           socket.data.user = auth;
//           next();
//         } else {
//           next(new Error("You are not authorized"));
//         }
//       } catch (error) {
//         next(new Error("Token verification failed"));
//       }
//     });

//     io.on("connection", async (socket) => {
//       const userId = socket.data.user.id;
//       console.log("User connected:", userId);

//       socket.join(userId);
//       const taskRepo = AppDataSource.getRepository(Task);
//       const tasks = await taskRepo.find({ where: { user: { id: userId } } });

//       const reminderService = new ReminderService();
//       // for (const task of tasks) {
//       //   const notification = await reminderService.checkDeadline(
//       //     userId,
//       //     task.id,
//       //   );
//       //   if (notification) {
//       //     socket.emit("deadline-notification", notification);
//       //   }
//       // }
//       try {
//         cron.schedule("* * * * *", async () => {
//           //
//         });

//         socket.on("assignTask", async ({ data, user }) => {
//           const admin_id = socket.data.user.id;

//           if (user) {
//             socket.join(user);
//             console.log(`User with ID ${user} has been joined to the room`);
//             const assign = await taskService.assignTask(admin_id, data, user);
//             const reminderService = new ReminderService();
//             const notification = await reminderService.checkDeadline(
//               user,
//               assign.id,
//             );

//             const userService = new UserService();
//             const task = await userService.getNotification(user);
//             io.to(user).emit("task-notification", { task });
//             console.log(`Task notification sent to user ${user}`);
//           } else {
//             console.log("No user ID provided for task assignment");
//           }
//         });
//       } catch (error: any) {
//         throw HttpException.badRequest(error?.message);
//       }

//       socket.on("disconnect", () => {
//         console.log("User disconnected:", userId);
//       });
//     });
//   }
// }

import { Server } from "socket.io";
import webTokenService from "../service/webToken.service";
import { DotenvConfig } from "../config/env.config";
import ReminderService from "../service/reminder.service";
import cron from "node-cron";
import taskService from "../service/task.service";
import UserService from "../service/user.service";
import HttpException from "../utils/HttpException.utils";
import { AppDataSource } from "../config/database.config";
import { Task } from "../entities/task.entity";

export class Socket {
  constructor(server: any) {
    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    io.use((socket, next) => {
      const socketToken = socket.handshake.auth.token;
      if (!socketToken) {
        return next(new Error("You are not authorized"));
      }
      try {
        const auth = webTokenService.verify(
          socketToken,
          DotenvConfig.ACCESS_TOKEN_SECRET,
        );
        if (auth) {
          socket.data.user = auth;
          next();
        } else {
          next(new Error("You are not authorized"));
        }
      } catch (error) {
        next(new Error("Token verification failed"));
      }
    });

    /*const birthdayMessage = await reminderService.checkBirthdays(userId);
          if (birthdayMessage) {
            io.to(userId).emit("birthday", birthdayMessage);
          } */
    io.on("connection", async (socket) => {
      const userId = socket.data.user.id;
      console.log("User connected:", userId);

      socket.join(userId);

      try {
        cron.schedule("* * * * *", async () => {
          const reminderService = new ReminderService();
          
          const taskRepo = AppDataSource.getRepository(Task);
      const tasks = await taskRepo.find({ where: { user: { id: userId } } });
      for (const task of tasks) {
        const notification = await reminderService.checkDeadline(
          userId,
          task.id,
        );
        if (notification) {
          socket.emit("task-notification", notification);
        }
      }
        });

        socket.on("assignTask", async ({ data, user }) => {
          const admin_id = socket.data.user.id;

          if (user) {
            socket.join(user);
            console.log(`User with ID ${user} has been joined`);
const assign = await taskService.assignTask(admin_id, data, user);

                          const reminderService = new ReminderService();
               const notification = await reminderService.checkDeadline(
              user,
              assign.id,
            );
           

            const userService = new UserService();
            const task = await userService.getNotification(user);

            io.to(user).emit("task-notification", { task });
            console.log(`Task notification sent to user ${user}`);
          } else {
            console.log("No user ID provided for task assignment");
          }
        });
      } catch (error: any) {
        throw HttpException.badRequest(error?.message);
      }

      socket.on("disconnect", () => {
        console.log("User disconnected:", userId);
      });
    });
  }
}