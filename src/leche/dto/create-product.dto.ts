import { IsInt, IsString, MaxLength } from 'class-validator'

export class CreateProductDto {
  @IsString()
  @MaxLength(200)
  nombre: string

  @IsInt()
  tipoProductoId: number

  @IsInt()
  proveedorId: number

  @IsString()
  @MaxLength(100)
  proveedorUltimaCompra: string

  @IsString()
  @MaxLength(50)
  codigoErp: string

  @IsString()
  @MaxLength(50)
  codigoProveedor: string

  @IsString()
  @MaxLength(50)
  codigoAlimentacion: string

  @IsInt()
  unidadMedidaId: number
}
