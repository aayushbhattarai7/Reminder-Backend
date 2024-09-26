import { Server } from "socket.io";
import webTokenService from "../service/webToken.service";
import { DotenvConfig } from "../config/env.config";
import ReminderService from "../service/reminder.service";
import cron from "node-cron";
import taskService from "../service/task.service";
import UserService from "../service/user.service";

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
        const auth = webTokenService.verify(socketToken, DotenvConfig.ACCESS_TOKEN_SECRET);
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

    io.on("connection", async (socket) => {
      const userId = socket.data.user.id;
      console.log("User connected:", userId);
      socket.join(userId);

      cron.schedule("15 1 * * *", async () => {
        const reminderService = new ReminderService();
        const birthdayMessage = await reminderService.checkBirthdays(userId);
        if (birthdayMessage) {
          io.to(userId).emit("birthday", birthdayMessage);
        }
      });
          const userService = new UserService() 
      const getTask = await userService.getUserTask(userId)
      const tasks = getTask?.message
       io.to(userId).emit("task-notification", {
       tasks
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", userId);
      });
    });
  }
}
