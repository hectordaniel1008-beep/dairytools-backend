import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { CreateCatalogDto } from './dto/create-catalog.dto'
import { UpdateCatalogDto } from './dto/update-catalog.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/dto/auth-response.dto'

@Controller('leche/productos')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seedData(@CurrentUser() user: JwtPayload) {
    await this.productsService.seedData(this.getEmpresaId(user))
    return { success: true, mensaje: 'Datos de prueba insertados correctamente' }
  }

  @Get()
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1
    const limitNum = limit ? parseInt(limit) : 20
    const result = await this.productsService.findAll(this.getEmpresaId(user), pageNum, limitNum, search)

    return {
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    }
  }

  @Get('catalogos')
  async getCatalogos(@CurrentUser() user: JwtPayload) {
    const catalogos = await this.productsService.getCatalogos(this.getEmpresaId(user))
    return { success: true, data: catalogos }
  }

  @Get('tipos-producto')
  async findAllTiposProducto(@CurrentUser() user: JwtPayload) {
    const tiposProducto = await this.productsService.findAllTiposProducto(this.getEmpresaId(user))
    return { success: true, data: tiposProducto }
  }

  @Get('tipo-producto')
  async findAllTiposProductoAlias(@CurrentUser() user: JwtPayload) {
    return this.findAllTiposProducto(user)
  }

  @Get('tipos')
  async findAllTiposProductoAlias2(@CurrentUser() user: JwtPayload) {
    return this.findAllTiposProducto(user)
  }

  @Post('tipos-producto')
  async createTipoProducto(@CurrentUser() user: JwtPayload, @Body() dto: CreateCatalogDto) {
    const tipoProducto = await this.productsService.createTipoProducto(this.getEmpresaId(user), dto)
    return { success: true, data: tipoProducto, mensaje: 'Tipo de producto creado exitosamente' }
  }

  @Post('tipo-producto')
  async createTipoProductoAlias(@CurrentUser() user: JwtPayload, @Body() dto: CreateCatalogDto) {
    return this.createTipoProducto(user, dto)
  }

  @Post('tipos')
  async createTipoProductoAlias2(@CurrentUser() user: JwtPayload, @Body() dto: CreateCatalogDto) {
    return this.createTipoProducto(user, dto)
  }

  @Patch('tipos-producto/:id')
  async updateTipoProducto(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCatalogDto) {
    const tipoProducto = await this.productsService.updateTipoProducto(this.getEmpresaId(user), parseInt(id), dto)
    return { success: true, data: tipoProducto, mensaje: 'Tipo de producto actualizado exitosamente' }
  }

  @Patch('tipo-producto/:id')
  async updateTipoProductoAlias(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCatalogDto) {
    return this.updateTipoProducto(user, id, dto)
  }

  @Patch('tipos/:id')
  async updateTipoProductoAlias2(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCatalogDto) {
    return this.updateTipoProducto(user, id, dto)
  }

  @Delete('tipos-producto/:id')
  async removeTipoProducto(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.productsService.removeTipoProducto(this.getEmpresaId(user), parseInt(id))
    return { success: true, mensaje: 'Tipo de producto eliminado exitosamente' }
  }

  @Delete('tipo-producto/:id')
  async removeTipoProductoAlias(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.removeTipoProducto(user, id)
  }

  @Delete('tipos/:id')
  async removeTipoProductoAlias2(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.removeTipoProducto(user, id)
  }

  @Get('unidades-medida')
  async findAllUnidadesMedida(@CurrentUser() user: JwtPayload) {
    const unidadesMedida = await this.productsService.findAllUnidadesMedida(this.getEmpresaId(user))
    return { success: true, data: unidadesMedida }
  }

  @Get('unidad-medida')
  async findAllUnidadesMedidaAlias(@CurrentUser() user: JwtPayload) {
    return this.findAllUnidadesMedida(user)
  }

  @Get('unidades')
  async findAllUnidadesMedidaAlias2(@CurrentUser() user: JwtPayload) {
    return this.findAllUnidadesMedida(user)
  }

  @Post('unidades-medida')
  async createUnidadMedida(@CurrentUser() user: JwtPayload, @Body() dto: CreateCatalogDto) {
    const unidadMedida = await this.productsService.createUnidadMedida(this.getEmpresaId(user), dto)
    return { success: true, data: unidadMedida, mensaje: 'Unidad de medida creada exitosamente' }
  }

  @Post('unidad-medida')
  async createUnidadMedidaAlias(@CurrentUser() user: JwtPayload, @Body() dto: CreateCatalogDto) {
    return this.createUnidadMedida(user, dto)
  }

  @Post('unidades')
  async createUnidadMedidaAlias2(@CurrentUser() user: JwtPayload, @Body() dto: CreateCatalogDto) {
    return this.createUnidadMedida(user, dto)
  }

  @Patch('unidades-medida/:id')
  async updateUnidadMedida(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCatalogDto) {
    const unidadMedida = await this.productsService.updateUnidadMedida(this.getEmpresaId(user), parseInt(id), dto)
    return { success: true, data: unidadMedida, mensaje: 'Unidad de medida actualizada exitosamente' }
  }

  @Patch('unidad-medida/:id')
  async updateUnidadMedidaAlias(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCatalogDto) {
    return this.updateUnidadMedida(user, id, dto)
  }

  @Patch('unidades/:id')
  async updateUnidadMedidaAlias2(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCatalogDto) {
    return this.updateUnidadMedida(user, id, dto)
  }

  @Delete('unidades-medida/:id')
  async removeUnidadMedida(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.productsService.removeUnidadMedida(this.getEmpresaId(user), parseInt(id))
    return { success: true, mensaje: 'Unidad de medida eliminada exitosamente' }
  }

  @Delete('unidad-medida/:id')
  async removeUnidadMedidaAlias(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.removeUnidadMedida(user, id)
  }

  @Delete('unidades/:id')
  async removeUnidadMedidaAlias2(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.removeUnidadMedida(user, id)
  }

  @Get('proveedores')
  async findAllProveedores(@CurrentUser() user: JwtPayload) {
    const proveedores = await this.productsService.findAllProveedores(this.getEmpresaId(user))
    return { success: true, data: proveedores }
  }

  @Get('proveedor')
  async findAllProveedoresAlias(@CurrentUser() user: JwtPayload) {
    return this.findAllProveedores(user)
  }

  @Post('proveedores')
  async createProveedor(@CurrentUser() user: JwtPayload, @Body() dto: CreateCatalogDto) {
    const proveedor = await this.productsService.createProveedor(this.getEmpresaId(user), dto)
    return { success: true, data: proveedor, mensaje: 'Proveedor creado exitosamente' }
  }

  @Post('proveedor')
  async createProveedorAlias(@CurrentUser() user: JwtPayload, @Body() dto: CreateCatalogDto) {
    return this.createProveedor(user, dto)
  }

  @Patch('proveedores/:id')
  async updateProveedor(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCatalogDto) {
    const proveedor = await this.productsService.updateProveedor(this.getEmpresaId(user), parseInt(id), dto)
    return { success: true, data: proveedor, mensaje: 'Proveedor actualizado exitosamente' }
  }

  @Patch('proveedor/:id')
  async updateProveedorAlias(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCatalogDto) {
    return this.updateProveedor(user, id, dto)
  }

  @Delete('proveedores/:id')
  async removeProveedor(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.productsService.removeProveedor(this.getEmpresaId(user), parseInt(id))
    return { success: true, mensaje: 'Proveedor eliminado exitosamente' }
  }

  @Delete('proveedor/:id')
  async removeProveedorAlias(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.removeProveedor(user, id)
  }

  @Get(':id')
  async findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const product = await this.productsService.findOne(this.getEmpresaId(user), parseInt(id))
    return { success: true, data: product }
  }

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(this.getEmpresaId(user), createProductDto)
    return { success: true, data: product, mensaje: 'Producto creado exitosamente' }
  }

  @Patch(':id')
  async update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const product = await this.productsService.update(this.getEmpresaId(user), parseInt(id), updateProductDto)
    return { success: true, data: product, mensaje: 'Producto actualizado exitosamente' }
  }

  @Delete(':id')
  async remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.productsService.remove(this.getEmpresaId(user), parseInt(id))
    return { success: true, mensaje: 'Producto eliminado exitosamente' }
  }

  private getEmpresaId(user: JwtPayload): number {
    if (!user.empresaId) {
      throw new BadRequestException('No hay empresa activa en la sesion')
    }

    return user.empresaId
  }
}
