import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Establo } from './establo.entity'

@Entity('corrales')
export class Corral {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'empresa_id', type: 'int', default: 1 })
    empresaId: number

    @Column({ length: 200 })
    descripcion: string

    @Column({ name: 'establo_id', type: 'int', nullable: false })
    establoId: number

    @ManyToOne(() => Establo, { nullable: false })
    @JoinColumn({ name: 'establo_id' })
    establo: Establo
}
