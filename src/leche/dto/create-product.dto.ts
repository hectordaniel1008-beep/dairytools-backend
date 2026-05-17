import { IsInt, IsString, MaxLength } from 'class-validator'

export class CreateProductDto {
  @IsString()
  @MaxLength(200)
  nombre: string

  @IsInt()
  tipoProductoId: number

  @IsInt()
  division: number

  @IsInt()
  proveedorUltimaCompra: number

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
