import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('establos')
export class Establo {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'empresa_id', type: 'int', default: 1 })
    empresaId: number

    @Column({ length: 200 })
    descripcion: string

    @Column({ length: 20 })
    numero: string
}
