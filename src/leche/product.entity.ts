import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm'

@Entity('productos')
export class Product {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 100 })
  nombre: string

  @Column({ length: 50, unique: true })
  clave: string

  @Column({ length: 50, nullable: true })
  categoria: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  precio: number

  @Column({ length: 20, nullable: true })
  unidad: string

  @Column({ length: 500, nullable: true })
  descripcion: string

  @Column({ default: true })
  estatus: boolean

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  stock: number

  @Column({ length: 20, nullable: true })
  codigoBarras: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
