import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm'
import { Exclude } from 'class-transformer'

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 100 })
  nombre: string

  @Column({ length: 150, unique: true })
  email: string

  @Column({ name: 'password_hash' })
  @Exclude()                         // nunca se serializa en respuestas JSON
  passwordHash: string

  @Column({ name: 'es_superadmin', default: false })
  esSuperadmin: boolean

  @Column({ name: 'empresa_default_id', nullable: true })
  empresaDefaultId: number

  @Column({ default: true })
  estatus: boolean

  @Column({ name: 'ultimo_acceso', nullable: true })
  ultimoAcceso: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
