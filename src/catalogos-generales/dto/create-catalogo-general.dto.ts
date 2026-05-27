import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator'

export class CreateCatalogoGeneralDto {
    @IsString()
    @IsNotEmpty()
    @Length(2, 200)
    descripcion: string

    @IsOptional()
    @IsString()
    @Length(1, 20)
    numero?: string

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    establoId?: number
}

export class UpdateCatalogoGeneralDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Length(2, 200)
    descripcion?: string

    @IsOptional()
    @IsString()
    @Length(1, 20)
    numero?: string

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    establoId?: number
}
