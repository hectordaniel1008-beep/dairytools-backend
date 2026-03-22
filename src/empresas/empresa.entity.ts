import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, OneToMany,
} from "typeorm"
import { UsuarioEmpresa } from "./usuario-empresa.entity"

@Entity("empresas")
export class Empresa {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 150 })
  nombre: string

  @Column({ length: 20, unique: true })
  clave: string

  @Column({ default: "#1e5a96" })
  color: string

  @Column({ name: "logo_url", nullable: true })
  logoUrl: string

  @Column({ default: true })
  estatus: boolean

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @OneToMany(() => UsuarioEmpresa, ue => ue.empresa)
  usuarioEmpresas: UsuarioEmpresa[]
}