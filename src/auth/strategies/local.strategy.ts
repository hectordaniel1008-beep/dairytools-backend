import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy }  from '@nestjs/passport'
import { Strategy }          from 'passport-local'
import { AuthService }       from '../auth.service'

// Valida email + password en POST /auth/login
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' })   // campo email en lugar de username
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password)
    if (!user) throw new UnauthorizedException('Credenciales incorrectas')
    return user
  }
}