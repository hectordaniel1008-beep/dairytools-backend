import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { UsuarioEmpresa } from "./usuario-empresa.entity"
import { Empresa } from "./empresa.entity"
import { CreateEmpresaDto } from "./dto/create-empresa.dto"
import { UpdateEmpresaDto } from "./dto/update-empresa.dto"

// Estructura que recibe el frontend
export interface EmpresaConRol {
  id: number
  nombre: string
  clave: string
  color: string
  rol: string
  es_default: boolean   // snake_case para coincidir con el tipo del frontend
  rfc: string
}

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(UsuarioEmpresa)
    private readonly ueRepo: Repository<UsuarioEmpresa>,
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
  ) { }

  // Empresas accesibles por el usuario con su rol
  async getEmpresasDeUsuario(
    usuarioId: number,
    _empresaDefaultId: number | null, // Ya no se usa este parámetro
  ): Promise<EmpresaConRol[]> {
    const relaciones = await this.ueRepo.find({
      where: { usuarioId, estatus: true },
      relations: ["empresa"],
    })

    return relaciones
      .filter(ue => ue.empresa?.estatus)
      .map(ue => ({
        id: ue.empresa.id,
        nombre: ue.empresa.nombre,
        clave: ue.empresa.clave,
        rfc: ue.empresa.rfc,
        color: ue.empresa.color,
        rol: ue.rol,
        es_default: ue.esDefault, // Usar el campo de la tabla usuario_empresa
      }))
      .sort((a, b) => {
        if (a.es_default) return -1
        if (b.es_default) return 1
        return a.nombre.localeCompare(b.nombre)
      })
  }

  // Verificar acceso y devolver empresa con rol (para cambio de empresa)
  async getAccesoUsuarioEmpresa(
    usuarioId: number,
    empresaId: number,
  ): Promise<EmpresaConRol> {
    const ue = await this.ueRepo.findOne({
      where: { usuarioId, empresaId, estatus: true },
      relations: ["empresa"],
    })

    if (!ue || !ue.empresa?.estatus) {
      throw new ForbiddenException("No tienes acceso a esta empresa")
    }

    return {
      id: ue.empresa.id,
      nombre: ue.empresa.nombre,
      clave: ue.empresa.clave,
      color: ue.empresa.color,
      rol: ue.rol,
      es_default: false,
      rfc: ue.empresa.rfc,
    }
  }

  // Todas las empresas (superadmin)
  async getTodasEmpresas(_empresaDefaultId?: number): Promise<EmpresaConRol[]> {
    const empresas = await this.empresaRepo.find({
      order: { nombre: "ASC" },
    })
    return empresas
      .map(e => ({
        id: e.id,
        nombre: e.nombre,
        clave: e.clave,
        color: e.color,
        rol: "admin",
        es_default: false, // Superadmin no tiene empresa por defecto específica
        rfc: e.rfc,
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
  }

  async getEmpresa(id: number): Promise<Empresa> {
    const empresa = await this.empresaRepo.findOne({
      where: { id },
    })
    if (!empresa) {
      throw new NotFoundException("Empresa no encontrada")
    }
    return empresa
  }

  async crearEmpresa(data: CreateEmpresaDto): Promise<Empresa> {
    const empresa = this.empresaRepo.create(data)
    return this.empresaRepo.save(empresa)
  }

  async actualizarEmpresa(id: number, data: UpdateEmpresaDto): Promise<Empresa> {
    const empresa = await this.empresaRepo.findOne({
      where: { id },
    })
    if (!empresa) {
      throw new NotFoundException("Empresa no encontrada")
    }
    Object.assign(empresa, data)
    return this.empresaRepo.save(empresa)
  }

  async eliminarEmpresa(id: number): Promise<void> {
    const empresa = await this.empresaRepo.findOne({
      where: { id },
    })
    if (!empresa) {
      throw new NotFoundException("Empresa no encontrada")
    }
    await this.empresaRepo.delete(id)
  }
}
