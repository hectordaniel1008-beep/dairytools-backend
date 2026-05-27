import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('dietas')
export class Dieta {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'empresa_id', type: 'int', default: 1 })
    empresaId: number

    @Column({ length: 200 })
    descripcion: string
}
