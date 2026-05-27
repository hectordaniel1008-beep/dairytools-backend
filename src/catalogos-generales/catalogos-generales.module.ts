import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CatalogosGeneralesController } from './catalogos-generales.controller'
import { CatalogosGeneralesService } from './catalogos-generales.service'
import { Establo } from './establo.entity'
import { Dieta } from './dieta.entity'
import { Almacen } from './almacen.entity'
import { TipoSalidaLeche } from './tipo-salida-leche.entity'
import { Corral } from './corral.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Establo, Dieta, Almacen, TipoSalidaLeche, Corral])],
    controllers: [CatalogosGeneralesController],
    providers: [CatalogosGeneralesService],
    exports: [CatalogosGeneralesService],
})
export class CatalogosGeneralesModule { }
