import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService }  from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { JwtPayload } from '../dto/auth-response.dto'

// Lee el JWT desde la cookie access_token (HTTP-Only)
function fromCookie(req: Request): string | null {
  return req?.cookies?.access_token ?? null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      // Intenta primero desde cookie, luego desde Authorization header
      jwtFromRequest: ExtractJwt.fromExtractors([
        fromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET'),
    })
  }

  async validate(payload: JwtPayload) {
    if (!payload?.sub) throw new UnauthorizedException('Token inválido')
    return payload   // se adjunta a request.user
  }
}