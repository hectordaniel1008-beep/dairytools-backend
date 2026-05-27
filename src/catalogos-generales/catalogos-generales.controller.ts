import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/dto/auth-response.dto'
import { CatalogosGeneralesService } from './catalogos-generales.service'
import { CreateCatalogoGeneralDto, UpdateCatalogoGeneralDto } from './dto/create-catalogo-general.dto'

@Controller('catalogos-generales')
@UseGuards(JwtAuthGuard)
export class CatalogosGeneralesController {
    constructor(private readonly catalogosGeneralesService: CatalogosGeneralesService) { }

    @Get('establos')
    async findAllEstablos(@CurrentUser() user: JwtPayload) {
        return { success: true, data: await this.catalogosGeneralesService.findAllEstablos(this.getEmpresaId(user)) }
    }

    @Post('establos')
    async createEstablo(@CurrentUser() user: JwtPayload, @Body() dto: CreateCatalogoGeneralDto) {
        const establo = await this.catalogosGeneralesService.createEstablo(this.getEmpresaId(user), dto)
        return { success: true, data: establo, mensaje: 'Establo creado exitosamente' }
    }

    @Patch('establos/:id')
    async updateEstablo(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCatalogoGeneralDto) {
        const establo = await this.catalogosGeneralesService.updateEstablo(this.getEmpresaId(user), parseInt(id), dto)
        return { success: true, data: establo, mensaje: 'Establo actualizado exitosamente' }
    }

    @Delete('establos/:id')
    async removeEstablo(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
        await this.catalogosGeneralesService.removeEstablo(this.getEmpresaId(user), parseInt(id))
        return { success: true, mensaje: 'Establo eliminado exitosamente' }
    }

    @Get('dietas')
    async findAllDietas(@CurrentUser() user: JwtPayload) {
        return { success: true, data: await this.catalogosGeneralesService.findAllDietas(this.getEmpresaId(user)) }
    }

    @Post('dietas')
    async createDieta(@CurrentUser() user: JwtPayload, @Body() dto: CreateCatalogoGeneralDto) {
        const dieta = await this.catalogosGeneralesService.createDieta(this.getEmpresaId(user), dto)
        return { success: true, data: dieta, mensaje: 'Dieta creada exitosamente' }
    }

    @Patch('dietas/:id')
    async updateDieta(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCatalogoGeneralDto) {
        const dieta = await this.catalogosGeneralesService.updateDieta(this.getEmpresaId(user), parseInt(id), dto)
        return { success: true, data: dieta, mensaje: 'Dieta actualizada exitosamente' }
    }

    @Delete('dietas/:id')
    async removeDieta(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
        await this.catalogosGeneralesService.removeDieta(this.getEmpresaId(user), parseInt(id))
        return { success: true, mensaje: 'Dieta eliminada exitosamente' }
    }

    @Get('almacenes')
    async findAllAlmacenes(@CurrentUser() user: JwtPayload) {
        return { success: true, data: await this.catalogosGeneralesService.findAllAlmacenes(this.getEmpresaId(user)) }
    }

    @Post('almacenes')
    async createAlmacen(@CurrentUser() user: JwtPayload, @Body() dto: CreateCatalogoGeneralDto) {
        const almacen = await this.catalogosGeneralesService.createAlmacen(this.getEmpresaId(user), dto)
        return { success: true, data: almacen, mensaje: 'Almacen creado exitosamente' }
    }

    @Patch('almacenes/:id')
    async updateAlmacen(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCatalogoGeneralDto) {
        const almacen = await this.catalogosGeneralesService.updateAlmacen(this.getEmpresaId(user), parseInt(id), dto)
        return { success: true, data: almacen, mensaje: 'Almacen actualizado exitosamente' }
    }

    @Delete('almacenes/:id')
    async removeAlmacen(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
        await this.catalogosGeneralesService.removeAlmacen(this.getEmpresaId(user), parseInt(id))
        return { success: true, mensaje: 'Almacen eliminado exitosamente' }
    }

    @Get('tipos-salida-leche')
    async findAllTiposSalidaLeche(@CurrentUser() user: JwtPayload) {
        return { success: true, data: await this.catalogosGeneralesService.findAllTiposSalidaLeche(this.getEmpresaId(user)) }
    }

    @Post('tipos-salida-leche')
    async createTipoSalidaLeche(@CurrentUser() user: JwtPayload, @Body() dto: CreateCatalogoGeneralDto) {
        const tipoSalida = await this.catalogosGeneralesService.createTipoSalidaLeche(this.getEmpresaId(user), dto)
        return { success: true, data: tipoSalida, mensaje: 'Tipo de salida de leche creado exitosamente' }
    }

    @Patch('tipos-salida-leche/:id')
    async updateTipoSalidaLeche(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCatalogoGeneralDto) {
        const tipoSalida = await this.catalogosGeneralesService.updateTipoSalidaLeche(this.getEmpresaId(user), parseInt(id), dto)
        return { success: true, data: tipoSalida, mensaje: 'Tipo de salida de leche actualizado exitosamente' }
    }

    @Delete('tipos-salida-leche/:id')
    async removeTipoSalidaLeche(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
        await this.catalogosGeneralesService.removeTipoSalidaLeche(this.getEmpresaId(user), parseInt(id))
        return { success: true, mensaje: 'Tipo de salida de leche eliminado exitosamente' }
    }

    @Get('corrales')
    async findAllCorrales(@CurrentUser() user: JwtPayload) {
        return { success: true, data: await this.catalogosGeneralesService.findAllCorrales(this.getEmpresaId(user)) }
    }

    @Post('corrales')
    async createCorral(@CurrentUser() user: JwtPayload, @Body() dto: CreateCatalogoGeneralDto) {
        const corral = await this.catalogosGeneralesService.createCorral(this.getEmpresaId(user), dto)
        return { success: true, data: corral, mensaje: 'Corral creado exitosamente' }
    }

    @Patch('corrales/:id')
    async updateCorral(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCatalogoGeneralDto) {
        const corral = await this.catalogosGeneralesService.updateCorral(this.getEmpresaId(user), parseInt(id), dto)
        return { success: true, data: corral, mensaje: 'Corral actualizado exitosamente' }
    }

    @Delete('corrales/:id')
    async removeCorral(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
        await this.catalogosGeneralesService.removeCorral(this.getEmpresaId(user), parseInt(id))
        return { success: true, mensaje: 'Corral eliminado exitosamente' }
    }

    private getEmpresaId(user: JwtPayload): number {
        if (!user.empresaId) {
            throw new BadRequestException('No hay empresa activa en la sesion')
        }

        return user.empresaId
    }
}
