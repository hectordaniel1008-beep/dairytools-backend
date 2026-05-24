import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from './product.entity'
import { TipoProducto } from './tipo-producto.entity'
import { UnidadMedida } from './unidad-medida.entity'
import { Proveedor } from './proveedor.entity'
import { ProductsService } from './products.service'
import { ProductsController } from './products.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Product, TipoProducto, UnidadMedida, Proveedor])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }
