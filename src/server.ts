import { createServer } from "http";
import { Server, io } from "./socket/socket";

import app from "./config/app.config";
import { DotenvConfig } from "./config/env.config";
import { AppDataSource } from "./config/database.config";
import ReminderService from "./service/reminder.service";
function listen() {
  const PORT = DotenvConfig.PORT;
  const httpServer = createServer(app);
  io.attach(httpServer);
  httpServer.listen(PORT);
  console.log(`Server is Listening in port: ${DotenvConfig.PORT}`);
}
// reminderService.startjob();

AppDataSource.initialize()
  .then(async () => {
    console.log("🚀 ~ Database Connected Successfully:");
    listen();
  })
  .catch((err) => {
    console.log(`🚀 ~ Database Failed to connect: ${err?.message}`);
  });
