export interface JwtPayload {
  sub: number
  nombre: string
  email: string
  esSuperadmin: boolean
  empresaId?: number
  iat?: number
  exp?: number
}

export interface AuthUser {
  id: number
  nombre: string
  email: string
  esSuperadmin: boolean
}
