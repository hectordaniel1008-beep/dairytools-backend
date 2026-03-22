import { Module }          from "@nestjs/common"
import { TypeOrmModule }   from "@nestjs/typeorm"
import { Empresa }         from "./empresa.entity"
import { UsuarioEmpresa }  from "./usuario-empresa.entity"
import { EmpresasService } from "./empresas.service"

@Module({
  imports:   [TypeOrmModule.forFeature([Empresa, UsuarioEmpresa])],
  providers: [EmpresasService],
  exports:   [EmpresasService],
})
export class EmpresasModule {}