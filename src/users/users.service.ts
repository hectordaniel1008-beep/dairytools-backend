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
import { UsuarioEmpresa } from '../empresas/usuario-empresa.entity'
import { Empresa } from '../empresas/empresa.entity'

interface AsignarEmpresaDto {
  empresaId: number
  esDefault: boolean
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    @InjectRepository(UsuarioEmpresa)
    private readonly usuarioEmpresaRepo: Repository<UsuarioEmpresa>,
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
  ) { }

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

    const savedUser = await this.repo.save(user)

    // Si es superadmin, asignar automáticamente todas las empresas
    if (savedUser.esSuperadmin) {
      await this.asignarTodasLasEmpresas(savedUser.id)
    }

    return savedUser
  }

  private async asignarTodasLasEmpresas(usuarioId: number): Promise<void> {
    const empresas = await this.empresaRepo.find({
      where: { estatus: true }
    })

    const usuarioEmpresas = empresas.map(empresa =>
      this.usuarioEmpresaRepo.create({
        usuarioId,
        empresaId: empresa.id,
        rol: 'admin',
        estatus: true,
        esDefault: false, // Los superadmin no necesitan empresa por defecto específica
      })
    )

    await this.usuarioEmpresaRepo.save(usuarioEmpresas)
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
      const eraSuperadmin = user.esSuperadmin
      user.esSuperadmin = dto.es_superadmin

      // Si se convirtió en superadmin, asignar todas las empresas
      if (!eraSuperadmin && dto.es_superadmin) {
        await this.asignarTodasLasEmpresas(user.id)
      }
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

  async obtenerEmpresasUsuario(usuarioId: number): Promise<UsuarioEmpresa[]> {
    return this.usuarioEmpresaRepo.find({
      where: { usuarioId },
      relations: ['empresa'],
    })
  }

  async actualizarEmpresasUsuario(usuarioId: number, asignaciones: AsignarEmpresaDto[]): Promise<void> {
    // Eliminar asignaciones existentes
    await this.usuarioEmpresaRepo.delete({ usuarioId })

    // Crear nuevas asignaciones
    const usuarioEmpresas = asignaciones.map(asignacion =>
      this.usuarioEmpresaRepo.create({
        usuarioId,
        empresaId: asignacion.empresaId,
        rol: 'operador',
        estatus: true,
        esDefault: asignacion.esDefault,
      })
    )

    await this.usuarioEmpresaRepo.save(usuarioEmpresas)
  }
}
