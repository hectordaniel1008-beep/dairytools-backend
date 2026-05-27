import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('almacenes')
export class Almacen {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'empresa_id', type: 'int', default: 1 })
    empresaId: number

    @Column({ length: 200 })
    descripcion: string
}
