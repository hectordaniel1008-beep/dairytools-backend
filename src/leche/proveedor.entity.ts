import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('proveedores')
export class Proveedor {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'empresa_id', type: 'int', default: 1 })
    empresaId: number

    @Column({ length: 200 })
    descripcion: string

    @Column({ length: 13, nullable: true })
    rfc?: string
}
