import {
  Injectable, UnauthorizedException, ForbiddenException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import * as crypto from "crypto"
import { UsersService } from "../users/users.service"
import { EmpresasService, EmpresaConRol } from "../empresas/empresas.service"
import { RefreshToken } from "./refresh-token.entity"
import { JwtPayload, AuthUser } from "./dto/auth-response.dto"

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly empresasService: EmpresasService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
  ) { }

  // ── Validar credenciales (usado por LocalStrategy) ───────
  async validateUser(email: string, password: string): Promise<AuthUser | null> {
    const user = await this.usersService.findByEmail(email.trim().toLowerCase())
    if (!user) return null

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return null

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      esSuperadmin: user.esSuperadmin,
    }
  }

  // ── Login: genera tokens y devuelve user + empresas ─────
  async login(user: AuthUser) {
    await this.usersService.updateUltimoAcceso(user.id)

    const empresas = user.esSuperadmin
      ? await this.empresasService.getTodasEmpresas(user.id)
      : await this.empresasService.getEmpresasDeUsuario(user.id, null)

    // Verificar que el usuario tenga al menos una empresa asignada
    if (!user.esSuperadmin && empresas.length === 0) {
      throw new ForbiddenException("No tienes empresas asignadas. Contacta al administrador.")
    }

    // Seleccionar la empresa marcada como default, si no la primera
    const empresaActiva = empresas.find(e => e.es_default) ?? empresas[0] ?? null

    const payload: JwtPayload = {
      sub: user.id,
      nombre: user.nombre,
      email: user.email,
      esSuperadmin: user.esSuperadmin,
      empresaId: empresaActiva?.id,
    }

    const accessToken = this.signAccessToken(payload)
    const refreshToken = await this.createRefreshToken(user.id)

    return { user, empresas, empresa_activa: empresaActiva, accessToken, refreshToken }
  }

  // ── Renovar access token ─────────────────────────────────
  async refresh(rawRefreshToken: string, rawAccessToken?: string) {
    const hash = this.hashToken(rawRefreshToken)

    const stored = await this.refreshRepo.findOne({
      where: { token: hash },
      relations: ["usuario"],
    })

    if (!stored || stored.expiraEn < new Date()) {
      throw new UnauthorizedException("Refresh token inválido o expirado")
    }

    await this.refreshRepo.delete({ id: stored.id })

    const user: AuthUser = {
      id: stored.usuario.id,
      nombre: stored.usuario.nombre,
      email: stored.usuario.email,
      esSuperadmin: stored.usuario.esSuperadmin,
    }

    const empresas = user.esSuperadmin
      ? await this.empresasService.getTodasEmpresas(user.id)
      : await this.empresasService.getEmpresasDeUsuario(user.id, null)

    // Verificar que el usuario tenga al menos una empresa asignada
    if (!user.esSuperadmin && empresas.length === 0) {
      throw new ForbiddenException("No tienes empresas asignadas. Contacta al administrador.")
    }

    const requestedEmpresaId = this.getEmpresaIdFromToken(rawAccessToken)
    const empresaActiva = empresas.find(e => e.id === requestedEmpresaId)
      ?? empresas.find(e => e.es_default)
      ?? empresas[0]
      ?? null

    const payload: JwtPayload = {
      sub: user.id,
      nombre: user.nombre,
      email: user.email,
      esSuperadmin: user.esSuperadmin,
      empresaId: empresaActiva?.id,
    }

    const accessToken = this.signAccessToken(payload)
    const refreshToken = await this.createRefreshToken(user.id)

    return { user, empresas, empresa_activa: empresaActiva, accessToken, refreshToken }
  }

  // ── Logout ───────────────────────────────────────────────
  async logout(rawRefreshToken?: string) {
    if (!rawRefreshToken) return
    const hash = this.hashToken(rawRefreshToken)
    await this.refreshRepo.delete({ token: hash })
  }

  // ── Perfil: user + empresas ──────────────────────────────
  async perfil(userId: number, empresaId?: number) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new UnauthorizedException("Usuario no encontrado")

    const authUser: AuthUser = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      esSuperadmin: user.esSuperadmin,
    }

    const empresas = user.esSuperadmin
      ? await this.empresasService.getTodasEmpresas(user.id)
      : await this.empresasService.getEmpresasDeUsuario(user.id, null)

    // Verificar que el usuario tenga al menos una empresa asignada
    if (!user.esSuperadmin && empresas.length === 0) {
      throw new ForbiddenException("No tienes empresas asignadas. Contacta al administrador.")
    }

    const empresaActiva = empresas.find(e => e.id === empresaId)
      ?? empresas.find(e => e.es_default)
      ?? empresas[0]
      ?? null

    return { user: authUser, empresas, empresa_activa: empresaActiva }
  }

  // ── Helpers privados ─────────────────────────────────────
  private signAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload)
  }

  private async createRefreshToken(userId: number): Promise<string> {
    const raw = crypto.randomBytes(64).toString("hex")
    const hash = this.hashToken(raw)
    const dias = parseInt(
      this.config.get("JWT_REFRESH_EXPIRES", "7d").replace("d", "")
    )
    const expiraEn = new Date()
    expiraEn.setDate(expiraEn.getDate() + dias)

    await this.refreshRepo.save({ usuarioId: userId, token: hash, expiraEn })
    return raw
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex")
  }

  private getEmpresaIdFromToken(token?: string): number | undefined {
    if (!token) return undefined

    const payload = this.jwtService.decode(token) as JwtPayload | null
    return payload?.empresaId
  }

  // ── Generar nuevo access token al cambiar empresa ────────
  async generarTokenConEmpresa(payload: JwtPayload, empresa: any) {
    const nuevoPayload: JwtPayload = {
      sub: payload.sub,
      nombre: payload.nombre,
      email: payload.email,
      esSuperadmin: payload.esSuperadmin,
      empresaId: empresa.id,
    }
    const accessToken = this.signAccessToken(nuevoPayload)
    return { accessToken }
  }
}
