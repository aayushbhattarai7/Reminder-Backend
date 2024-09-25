import { Server } from "socket.io";
import webTokenService from "../service/webToken.service";
import { DotenvConfig } from "../config/env.config";
import ReminderService from "../service/reminder.service";

export class Socket {
  Socket(server: any) {
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

      const reminderService = new ReminderService();

      try {
        const birthdayMessage = await reminderService.checkBirthdays(userId);
        if (birthdayMessage) {
          socket.emit("birthday", birthdayMessage); 
        } else {
          console.log('No birthday messages found');
        }
      } catch (error) {
        console.error("Error in sending birthday message:", error);
      }

      socket.on("disconnect", () => {
        console.log("User disconnected:", userId);
      });
    });

  }
}
