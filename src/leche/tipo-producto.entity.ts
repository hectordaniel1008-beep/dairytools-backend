import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('tipos_producto')
export class TipoProducto {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'empresa_id', type: 'int', default: 1 })
  empresaId: number

  @Column({ length: 200 })
  descripcion: string
}
