import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from "@nestjs/common"
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard"
import { EmpresasService } from "./empresas.service"
import { CreateEmpresaDto } from "./dto/create-empresa.dto"
import { UpdateEmpresaDto } from "./dto/update-empresa.dto"

@UseGuards(JwtAuthGuard)
@Controller("empresas")
export class EmpresasController {
    constructor(private readonly empresasService: EmpresasService) { }

    @Get()
    async listar() {
        const empresas = await this.empresasService.getTodasEmpresas()
        return {
            success: true,
            data: empresas,
        }
    }

    @Get(":id")
    async obtener(@Param("id", ParseIntPipe) id: number) {
        const empresa = await this.empresasService.getEmpresa(id)
        return {
            success: true,
            data: empresa,
        }
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async crear(@Body() dto: CreateEmpresaDto) {
        const empresa = await this.empresasService.crearEmpresa(dto)
        return {
            success: true,
            data: empresa,
            mensaje: "Empresa creada correctamente",
        }
    }

    @Patch(":id")
    async actualizar(
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: UpdateEmpresaDto,
    ) {
        const empresa = await this.empresasService.actualizarEmpresa(id, dto)
        return {
            success: true,
            data: empresa,
            mensaje: "Empresa actualizada correctamente",
        }
    }

    @Delete(":id")
    async eliminar(@Param("id", ParseIntPipe) id: number) {
        await this.empresasService.eliminarEmpresa(id)
        return {
            success: true,
            mensaje: "Empresa eliminada correctamente",
        }
    }
}
