import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('unidades_medida')
export class UnidadMedida {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'empresa_id', type: 'int', default: 1 })
  empresaId: number

  @Column({ length: 200 })
  descripcion: string
}
