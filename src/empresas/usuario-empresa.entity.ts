import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from "typeorm"
import { User }    from "../users/user.entity"
import { Empresa } from "./empresa.entity"

@Entity("usuario_empresa")
export class UsuarioEmpresa {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: "usuario_id" })
  usuarioId: number

  @Column({ name: "empresa_id" })
  empresaId: number

  @Column({ default: "operador" })
  rol: string

  @Column({ default: true })
  estatus: boolean

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "usuario_id" })
  usuario: User

  @ManyToOne(() => Empresa, e => e.usuarioEmpresas, { onDelete: "CASCADE" })
  @JoinColumn({ name: "empresa_id" })
  empresa: Empresa
}