import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { Empresa } from "./empresa.entity"
import { UsuarioEmpresa } from "./usuario-empresa.entity"
import { EmpresasService } from "./empresas.service"
import { EmpresasController } from "./empresas.controller"

@Module({
  imports: [TypeOrmModule.forFeature([Empresa, UsuarioEmpresa])],
  controllers: [EmpresasController],
  providers: [EmpresasService],
  exports: [EmpresasService],
})
export class EmpresasModule { }