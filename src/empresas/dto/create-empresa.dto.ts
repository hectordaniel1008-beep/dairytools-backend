import { IsString, IsNotEmpty, Length, IsOptional, IsHexColor, IsUrl, IsBoolean } from "class-validator"

export class CreateEmpresaDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 150)
    nombre: string

    @IsString()
    @IsNotEmpty()
    @Length(2, 20)
    clave: string

    @IsOptional()
    @IsHexColor()
    color?: string

    @IsOptional()
    @IsBoolean()
    estatus?: boolean

    @IsOptional()
    @IsUrl()
    logoUrl?: string
}
