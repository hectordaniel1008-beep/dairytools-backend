import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { JwtPayload } from '../auth/dto/auth-response.dto'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './user.entity'

function toUsuarioJson(u: User) {
  return {
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    es_superadmin: u.esSuperadmin,
    estatus: u.estatus,
  }
}

@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async listar() {
    const usuarios = await this.usersService.listarTodos()
    return {
      success: true,
      data: usuarios.map(toUsuarioJson),
    }
  }

  @Get(':id')
  async obtener(@Param('id', ParseIntPipe) id: number) {
    const usuario = await this.usersService.obtenerPorId(id)
    return {
      success: true,
      data: toUsuarioJson(usuario),
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crear(@Body() dto: CreateUserDto) {
    const usuario = await this.usersService.crear(dto)
    return {
      success: true,
      data: toUsuarioJson(usuario),
      mensaje: 'Usuario creado correctamente',
    }
  }

  @Patch(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    const usuario = await this.usersService.actualizar(id, dto)
    return {
      success: true,
      data: toUsuarioJson(usuario),
      mensaje: 'Usuario actualizado correctamente',
    }
  }

  @Delete(':id')
  async eliminar(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() payload: JwtPayload,
  ) {
    if (id === payload.sub) {
      throw new BadRequestException('No puedes eliminar tu propio usuario')
    }
    await this.usersService.eliminar(id)
    return {
      success: true,
      mensaje: 'Usuario eliminado correctamente',
    }
  }
}
