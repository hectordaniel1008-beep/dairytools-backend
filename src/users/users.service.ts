import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({
      where: { email: email.trim().toLowerCase(), estatus: true },
    })
  }

  findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id, estatus: true } })
  }

  async updateUltimoAcceso(id: number) {
    await this.repo.update(id, { ultimoAcceso: new Date() })
  }

  async listarTodos(): Promise<User[]> {
    return this.repo.find({ order: { nombre: 'ASC' } })
  }

  async obtenerPorId(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }
    return user
  }

  async crear(dto: CreateUserDto): Promise<User> {
    const email = dto.email.trim().toLowerCase()
    const exists = await this.repo.findOne({ where: { email } })
    if (exists) {
      throw new ConflictException('El correo ya está registrado')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = this.repo.create({
      nombre: dto.nombre.trim(),
      email,
      passwordHash,
      esSuperadmin: dto.es_superadmin ?? false,
      estatus: dto.estatus ?? true,
    })
    return this.repo.save(user)
  }

  async actualizar(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.repo.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase()
      if (email !== user.email) {
        const taken = await this.repo.findOne({ where: { email } })
        if (taken && taken.id !== id) {
          throw new ConflictException('El correo ya está registrado')
        }
        user.email = email
      }
    }

    if (dto.nombre !== undefined) {
      user.nombre = dto.nombre.trim()
    }
    if (dto.password !== undefined && dto.password.length > 0) {
      user.passwordHash = await bcrypt.hash(dto.password, 10)
    }
    if (dto.es_superadmin !== undefined) {
      user.esSuperadmin = dto.es_superadmin
    }
    if (dto.estatus !== undefined) {
      user.estatus = dto.estatus
    }

    return this.repo.save(user)
  }

  async eliminar(id: number): Promise<void> {
    const res = await this.repo.delete(id)
    if (!res.affected) {
      throw new NotFoundException('Usuario no encontrado')
    }
  }
}
