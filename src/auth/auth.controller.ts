import {
  Controller, Post, Get, Req, Res, Body,
  UseGuards, HttpCode, HttpStatus,
} from "@nestjs/common"
import { AuthGuard }         from "@nestjs/passport"
import { Request, Response } from "express"
import { AuthService }       from "./auth.service"
import { EmpresasService }   from "../empresas/empresas.service"
import { JwtAuthGuard }      from "../common/guards/jwt-auth.guard"
import { CurrentUser }       from "../common/decorators/current-user.decorator"
import { LoginDto }          from "./dto/login.dto"
import { JwtPayload, AuthUser } from "./dto/auth-response.dto"
import { ConfigService }     from "@nestjs/config"
import { IsNumber } from "class-validator"

class CambiarEmpresaDto {
  @IsNumber()
  empresa_id: number
}

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService:    AuthService,
    private readonly empresasService: EmpresasService,
    private readonly config:         ConfigService,
  ) {}

  // ── POST /auth/login ─────────────────────────────────────
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard("local"))
  async login(
    @Req() req: Request & { user: AuthUser },
    @Res({ passthrough: true }) res: Response,
    @Body() _dto: LoginDto,
  ) {
    const { user, empresas, empresa_activa, accessToken, refreshToken }
      = await this.authService.login(req.user)

    this.setCookies(res, accessToken, refreshToken)

    return {
      success: true,
      data:    { user, empresas, empresa_activa },
      mensaje: "Inicio de sesión exitoso",
    }
  }

  // ── POST /auth/logout ────────────────────────────────────
  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token
    await this.authService.logout(refreshToken)
    this.clearCookies(res)
    return { success: true, mensaje: "Sesión cerrada correctamente" }
  }

  // ── POST /auth/refresh ───────────────────────────────────
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawToken = req.cookies?.refresh_token
    if (!rawToken) {
      res.status(401).json({ success: false, mensaje: "Refresh token no encontrado" })
      return
    }
    const { user, empresas, empresa_activa, accessToken, refreshToken }
      = await this.authService.refresh(rawToken)

    this.setCookies(res, accessToken, refreshToken)

    return {
      success: true,
      data:    { user, empresas, empresa_activa },
      mensaje: "Token renovado",
    }
  }

  // ── GET /auth/perfil ─────────────────────────────────────
  @Get("perfil")
  @UseGuards(JwtAuthGuard)
  async perfil(@CurrentUser() payload: JwtPayload) {
    const { user, empresas, empresa_activa } = await this.authService.perfil(payload.sub)
    return {
      success: true,
      data:    { user, empresas, empresa_activa },
    }
  }

  // ── POST /auth/cambiar-empresa ───────────────────────────
  // Cambia la empresa activa en la sesión sin necesidad de re-login
  @Post("cambiar-empresa")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async cambiarEmpresa(
    @CurrentUser() payload: JwtPayload,
    @Body() body: CambiarEmpresaDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Verificar acceso y obtener empresa con rol
    const empresa = await this.empresasService.getAccesoUsuarioEmpresa(
      payload.sub,
      body.empresa_id,
    )

    // Generar nuevo access token con la empresa seleccionada
    const { accessToken } = await this.authService.generarTokenConEmpresa(
      payload,
      empresa,
    )

    // Solo renovar el access token, el refresh se mantiene
    const prod = this.isProd()
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure:   prod,
      sameSite: prod ? "strict" : "lax",
      maxAge:   15 * 60 * 1000,
    })

    return {
      success: true,
      data:    { empresa_activa: empresa },
      mensaje: "Empresa cambiada correctamente",
    }
  }

  // ── Helpers ──────────────────────────────────────────────
  private isProd() {
    return this.config.get("NODE_ENV") === "production"
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const prod = this.isProd()
    res.cookie("access_token", accessToken, {
      httpOnly: true, secure: prod,
      sameSite: prod ? "strict" : "lax",
      maxAge:   15 * 60 * 1000,
    })
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true, secure: prod,
      sameSite: prod ? "strict" : "lax",
      path:     "/auth/refresh",
      maxAge:   7 * 24 * 60 * 60 * 1000,
    })
  }

  private clearCookies(res: Response) {
    res.clearCookie("access_token")
    res.clearCookie("refresh_token", { path: "/auth/refresh" })
  }
}
