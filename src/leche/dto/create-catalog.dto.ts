import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'

export class CreateCatalogDto {
    @IsString()
    @IsNotEmpty()
    @Length(2, 200)
    descripcion: string

    @IsOptional()
    @IsString()
    @Length(10, 13)
    rfc?: string
}
