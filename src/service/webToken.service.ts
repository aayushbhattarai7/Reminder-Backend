import jwt from 'jsonwebtoken'
import { IJwtOptions, IJwtPayload } from '../interface/jwt.interface';
import { DotenvConfig } from '../config/env.config';
class WebTokenService {
    sign(user: IJwtPayload, options: IJwtOptions) {
        return jwt.sign(
            {
            id:user.id
            }, 
            options.secret
        )
    }
    verify(token: string, secret: string): any {
        return jwt.verify(token, secret)
    }

    generateTokens(user:IJwtPayload):{accessToken:string, refreshToken:string} {
        const accessToken = this.sign(user,
            {
                expiresIn: DotenvConfig.ACCESS_TOKEN_EXPIRES_IN,
                secret:DotenvConfig.ACCESS_TOKEN_SECRET
                
            }
        )
        const refreshToken = this.sign(user, {
            expiresIn: DotenvConfig.REFRESH_TOKEN_EXPIRES_IN,
            secret:DotenvConfig.REFRESH_TOKEN_SECRET
        })
        return{accessToken, refreshToken}
    }

    generateAccessToken(user: IJwtPayload): string {
        return this.sign(
            user, {
                expiresIn: DotenvConfig.ACCESS_TOKEN_EXPIRES_IN,
                secret:DotenvConfig.ACCESS_TOKEN_SECRET
            }
        )
    }
}

export default new WebTokenService()