import { IsString, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator'

export class CreateProductDto {
  @IsString()
  @MaxLength(100)
  nombre: string

  @IsString()
  @MaxLength(50)
  clave: string

  @IsString()
  @IsOptional()
  @MaxLength(50)
  categoria?: string

  @IsNumber()
  @IsOptional()
  @Min(0)
  precio?: number

  @IsString()
  @IsOptional()
  @MaxLength(20)
  unidad?: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  descripcion?: string

  @IsBoolean()
  @IsOptional()
  estatus?: boolean

  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number

  @IsString()
  @IsOptional()
  @MaxLength(20)
  codigoBarras?: string
}
