import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('tipos_salida_leche')
export class TipoSalidaLeche {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'empresa_id', type: 'int', default: 1 })
    empresaId: number

    @Column({ length: 200 })
    descripcion: string
}
