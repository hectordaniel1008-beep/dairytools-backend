import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('unidades_medida')
export class UnidadMedida {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 200 })
  descripcion: string
}
