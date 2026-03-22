import { Module }           from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule }        from '@nestjs/jwt'
import { PassportModule }   from '@nestjs/passport'
import { TypeOrmModule }    from '@nestjs/typeorm'
import { UsersModule }      from '../users/users.module'
import { EmpresasModule }   from '../empresas/empresas.module'
import { AuthController }   from './auth.controller'
import { AuthService }      from './auth.service'
import { JwtStrategy }      from './strategies/jwt.strategy'
import { LocalStrategy }    from './strategies/local.strategy'
import { RefreshToken }     from './refresh-token.entity'

@Module({
  imports: [
    UsersModule,
    EmpresasModule,
    PassportModule,
    ConfigModule,
    TypeOrmModule.forFeature([RefreshToken]),

    JwtModule.registerAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:      config.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_EXPIRES', '15m') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers:   [AuthService, JwtStrategy, LocalStrategy],
  exports:     [AuthService],
})
export class AuthModule {}
