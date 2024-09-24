import { Request, Response, Application, NextFunction } from "express";
import cors from 'cors'
import { DotenvConfig } from "../config/env.config";
import { StatusCodes } from "../constant/StatusCodes";
import routes from '../routes/index.routes'
import bodyParser from "body-parser";

const middleware = (app: Application) => {
    app.use(cors({
        origin:'*'
    }))
   
    app.use((req: Request, res: Response, next: NextFunction) => {
        const userAgent = req.headers['userAgent'];
        const apikey = req.headers['apikey']
        if (userAgent && userAgent.includes('mozilla')) {
            next()
        } else {
            if (apikey === DotenvConfig.API_KEY) {
                next()
            } else {
                res.status(StatusCodes.FORBIDDEN).send('Forbidden')
            }
        }
    })

    app.use(bodyParser.json())
    app.use('/api',routes)
}

export default middleware