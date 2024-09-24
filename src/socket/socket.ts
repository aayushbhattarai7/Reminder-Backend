import { Server } from "socket.io";
import webTokenService from "../service/webToken.service";
import { DotenvConfig } from "../config/env.config";

export class Socket {
    async Socket(server: any) {
        const io = new Server(server, {
            cors: {
                origin: '*',    
        }
        })
        io.use((socket, next) => {
            const socketToken = socket.handshake.auth.token;
            if (!socketToken) throw new Error('You are not authorized')
            try {
                const auth = webTokenService.verify(socketToken, DotenvConfig.ACCESS_TOKEN_SECRET)
                if (auth) {
                    socket.data.user = auth
                    next()
                } else {
                    next(new Error('You are not authorized'))
                }
            } catch (error: unknown) {
                if (error instanceof Error) {
                    next(new Error(error.message))
                }
            }
        })

        
}}