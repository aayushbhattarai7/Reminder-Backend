import { Server } from "socket.io";
import webTokenService from "../service/webToken.service";
import { DotenvConfig } from "../config/env.config";
import ReminderService from "../service/reminder.service";
import cron from "node-cron";
import taskService from "../service/task.service";
import UserService from "../service/user.service";
import HttpException from "../utils/HttpException.utils";

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
          DotenvConfig.ACCESS_TOKEN_SECRET
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

    io.on("connection", async (socket) => {
      const userId = socket.data.user.id;
      console.log("User connected:", userId);

      socket.join(userId);

      try {
        cron.schedule("15 1 * * *", async () => {
          const reminderService = new ReminderService();
          const birthdayMessage = await reminderService.checkBirthdays(userId);
          if (birthdayMessage) {
            io.to(userId).emit("birthday", birthdayMessage);
          }
        });

       socket.on("assignTask", async ({ data, user }) => {
  const admin_id = socket.data.user.id;
  const user_id = Array.isArray(user) && user.length > 0
    ? user[0].replace(/[{}]/g, "")
    : null;

  if (user_id) {
    socket.join(user_id); 
    console.log(`User with ID ${user_id} has been joined to the room`);

    const assign = await taskService.assignTask(admin_id, data, user_id);

    const userService = new UserService();
    const task = await userService.getNotification(user_id);

    io.to(user_id).emit("task-notification", { task });
    console.log(`Task notification sent to user ${user_id}`);
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
