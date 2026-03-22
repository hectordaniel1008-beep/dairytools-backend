import { NestFactory }        from '@nestjs/core'
import { ValidationPipe }     from '@nestjs/common'
import { ConfigService }      from '@nestjs/config'
import * as cookieParser      from 'cookie-parser'
import { AppModule }          from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

  // ── Cookies (para JWT HTTP-Only) ─────────────────────────
  app.use(cookieParser())

  // ── CORS ─────────────────────────────────────────────────
  app.enableCors({
    origin:      config.get('FRONTEND_URL') ?? 'http://localhost:3000',
    credentials: true,   // permite enviar/recibir cookies
    methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // ── Validación global de DTOs ─────────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist:        true,   // elimina campos no declarados en el DTO
    forbidNonWhitelisted: true,
    transform:        true,   // convierte tipos automáticamente
  }))

  // ── Filtro global de errores ─────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter())

  const port = config.get<number>('PORT') ?? 3001
  await app.listen(port)
  console.log(`🚀 DairyTools API corriendo en http://localhost:${port}`)
}

bootstrap()
