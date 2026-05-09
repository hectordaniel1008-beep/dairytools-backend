import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

@Controller('leche/productos')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seedData() {
    await this.productsService.seedData()
    return {
      success: true,
      mensaje: 'Datos de prueba insertados correctamente'
    }
  }

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1
    const limitNum = limit ? parseInt(limit) : 20
    
    const result = await this.productsService.findAll(pageNum, limitNum, search)
    
    return {
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(parseInt(id))
    return {
      success: true,
      data: product
    }
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(createProductDto)
    return {
      success: true,
      data: product,
      mensaje: 'Producto creado exitosamente'
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const product = await this.productsService.update(parseInt(id), updateProductDto)
    return {
      success: true,
      data: product,
      mensaje: 'Producto actualizado exitosamente'
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productsService.remove(parseInt(id))
    return {
      success: true,
      mensaje: 'Producto eliminado exitosamente'
    }
  }

  @Get('clave/next')
  async getNextClave() {
    const clave = await this.productsService.generarClave()
    return {
      success: true,
      data: { clave }
    }
  }
}
