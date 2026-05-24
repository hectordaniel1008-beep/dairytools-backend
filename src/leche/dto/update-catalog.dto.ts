import { IsOptional, IsString, Length } from 'class-validator'

export class UpdateCatalogDto {
    @IsOptional()
    @IsString()
    @Length(2, 200)
    descripcion?: string

    @IsOptional()
    @IsString()
    @Length(10, 13)
    rfc?: string
}
