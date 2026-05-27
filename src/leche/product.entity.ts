import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { TipoProducto } from './tipo-producto.entity'
import { UnidadMedida } from './unidad-medida.entity'
import { Proveedor } from './proveedor.entity'

@Entity('productos')
export class Product {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'empresa_id', type: 'int', default: 1 })
  empresaId: number

  @Column({ length: 200, nullable: true })
  nombre: string

  @Column({ name: 'tipo_producto_id', type: 'int', nullable: true })
  tipoProductoId: number

  @ManyToOne(() => TipoProducto, { nullable: true })
  @JoinColumn({ name: 'tipo_producto_id' })
  tipoProducto: TipoProducto

  @Column({ type: 'int', default: 1 })
  division: number

  @Column({ name: 'proveedor_id', type: 'int', nullable: true })
  proveedorId: number

  @ManyToOne(() => Proveedor, { nullable: true })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor

  @Column({ name: 'proveedor_ultima_compra', length: 100, nullable: true })
  proveedorUltimaCompra: string

  @Column({ name: 'codigo_erp', length: 50, nullable: true })
  codigoErp: string

  @Column({ name: 'codigo_proveedor', length: 50, nullable: true })
  codigoProveedor: string

  @Column({ name: 'codigo_alimentacion', length: 50, nullable: true })
  codigoAlimentacion: string

  @Column({ name: 'unidad_medida_id', type: 'int', nullable: true })
  unidadMedidaId: number

  @ManyToOne(() => UnidadMedida, { nullable: true })
  @JoinColumn({ name: 'unidad_medida_id' })
  unidadMedida: UnidadMedida
}
