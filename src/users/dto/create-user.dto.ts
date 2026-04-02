import {
  IsString,
  IsNotEmpty,
  Length,
  IsEmail,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator'

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  nombre: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string

  @IsOptional()
  @IsBoolean()
  es_superadmin?: boolean

  @IsOptional()
  @IsBoolean()
  estatus?: boolean
}
