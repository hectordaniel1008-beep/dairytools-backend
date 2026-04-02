import {
  IsString,
  Length,
  IsEmail,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  nombre?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string

  @IsOptional()
  @IsBoolean()
  es_superadmin?: boolean

  @IsOptional()
  @IsBoolean()
  estatus?: boolean
}
