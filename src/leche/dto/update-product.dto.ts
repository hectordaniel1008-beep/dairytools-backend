import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nombre?: string

  @IsInt()
  @IsOptional()
  tipoProductoId?: number

  @IsInt()
  @IsOptional()
  division?: number

  @IsInt()
  @IsOptional()
  proveedorUltimaCompra?: number

  @IsString()
  @IsOptional()
  @MaxLength(50)
  codigoErp?: string

  @IsString()
  @IsOptional()
  @MaxLength(50)
  codigoProveedor?: string

  @IsString()
  @IsOptional()
  @MaxLength(50)
  codigoAlimentacion?: string

  @IsInt()
  @IsOptional()
  unidadMedidaId?: number
}
