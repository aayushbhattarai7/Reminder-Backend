import { Server } from "socket.io";
import webTokenService from "../service/webToken.service";
import { DotenvConfig } from "../config/env.config";
import ReminderService from "../service/reminder.service";
import taskService from "../service/task.service";
import UserService from "../service/user.service";
import HttpException from "../utils/HttpException.utils";
import http from "http";
import express from "express";
import adminService from "../service/admin.service";
const app = express();
const server = http.createServer(app);
const userService = new UserService();

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
io.on("connection", async (socket) => {
  const userId = socket.data.user.id;
  console.log("User connected:", userId);

  socket.join(userId);

  socket.on("send-task-id", async ({ task_id, task_deadline }) => {
    const reminderService = new ReminderService();
    console.log(task_id,'hehehaha')
    try {
      const notification = await reminderService.checkDeadline(
        userId,
        task_id,
        task_deadline,
      );
    } catch (error) {
      console.error("Error in send-task-id:", error);
    }
  }); 

  try {
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
          assign.deadline,
        );

        const userService = new UserService();
        const task = await userService.getNotification(user);
        io.to(user).emit("task-notification", { task });
        console.log(`Task notification sent to user ${user}`);
      } else {
        console.log("No user ID provided for task assignment");
      }
    });

    socket.on("complete", async ({ task_id, admin_id }) => {
      const user_id = socket.data.user.id;

      if (admin_id) {
        socket.join(admin_id);
        console.log(`User with ID ${admin_id} has been joined`);
        const assign = await userService.completeTask(
          task_id,
          user_id,
          admin_id,
        );

        const task = await adminService.getNotification(admin_id);
        io.to(admin_id).emit("complete-notification", { task });
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

export { Server, io };
