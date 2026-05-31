import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

  const allowedOrigins = [
    'http://localhost:5173',     // Desarrollo local
    'http://localhost:3000',     // Mismo origen
    /\.trycloudflare\.com$/,     // CUALQUIER subdominio de trycloudflare.com
  ];

  app.use((cookieParser as any)())

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.some(pattern =>
        typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
      )) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.useGlobalFilters(new HttpExceptionFilter())

  // Render asigna el puerto via variable de entorno PORT
  const port = config.get<number>('PORT') ?? 3001
  await app.listen(port, '0.0.0.0')  // 0.0.0.0 necesario en Render
  console.log(`🚀 DairyTools API corriendo en puerto ${port}`)
}

bootstrap()
