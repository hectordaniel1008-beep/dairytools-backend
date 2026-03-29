import { IsString, IsOptional, Length, IsHexColor, IsUrl, IsBoolean } from "class-validator"

export class UpdateEmpresaDto {
    @IsOptional()
    @IsString()
    @Length(3, 150)
    nombre?: string

    @IsOptional()
    @IsString()
    @Length(2, 20)
    clave?: string

    @IsOptional()
    @IsHexColor()
    color?: string

    @IsOptional()
    @IsUrl()
    logoUrl?: string

    @IsOptional()
    @IsBoolean()
    estatus?: boolean
}
