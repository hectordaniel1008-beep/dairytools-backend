import { Module }         from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule }  from '@nestjs/typeorm'
import { AuthModule }     from './auth/auth.module'
import { UsersModule }    from './users/users.module'
import { EmpresasModule } from './empresas/empresas.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    TypeOrmModule.forRootAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get('NODE_ENV') === 'production'

        return {
          type:     'postgres',
          host:     config.get('DB_HOST',  'localhost'),
          port:     config.get<number>('DB_PORT', 5432),
          database: config.get('DB_NAME',  'dairytools'),
          username: config.get('DB_USER',  'postgres'),
          password: config.get('DB_PASS',  ''),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],

          // En producción NO usar synchronize — riesgo de borrar datos
          synchronize: !isProduction,

          // SSL requerido por Render PostgreSQL y la mayoría de BDs en la nube
          ssl: isProduction
            ? { rejectUnauthorized: false }
            : false,

          logging: !isProduction,
        }
      },
    }),

    AuthModule,
    UsersModule,
    EmpresasModule,
  ],
})
export class AppModule {}
