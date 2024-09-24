import { createServer } from 'http'
import {Socket} from './socket/socket'
import app from './config/app.config'
import { DotenvConfig } from './config/env.config'
import { AppDataSource } from './config/database.config'
import { CronService } from './service/cron.service'
import UserService from './service/user.service'
function listen() {
    const socket = new Socket()
    const PORT = DotenvConfig.PORT
    const httpServer = createServer(app)
    socket.Socket(httpServer)
    httpServer.listen(PORT)
    console.log(`Server is Listening in port: ${DotenvConfig.PORT}`)
}
const cronService = new CronService()
cronService.startjob()

AppDataSource.initialize()
    .then(async() => {
        console.log("🚀 ~ Database Connected Successfully:")
        listen()
    })
    .catch((err) => {
        console.log(`🚀 ~ Database Failed to connect: ${err?.message}`,)
})