import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const rawMsg = exception instanceof HttpException
      ? exception.getResponse()
      : 'Error interno del servidor'

    const mensaje = typeof rawMsg === 'string'
      ? rawMsg
      : (rawMsg as any).message ?? JSON.stringify(rawMsg)

    response.status(status).json({
      success:    false,
      statusCode: status,
      mensaje:    Array.isArray(mensaje) ? mensaje.join(', ') : mensaje,
    })
  }
}
