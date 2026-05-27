import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Product } from './product.entity'
import { TipoProducto } from './tipo-producto.entity'
import { UnidadMedida } from './unidad-medida.entity'
import { Proveedor } from './proveedor.entity'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { CreateCatalogDto } from './dto/create-catalog.dto'
import { UpdateCatalogDto } from './dto/update-catalog.dto'

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(TipoProducto)
    private readonly tipoProductoRepo: Repository<TipoProducto>,
    @InjectRepository(UnidadMedida)
    private readonly unidadMedidaRepo: Repository<UnidadMedida>,
    @InjectRepository(Proveedor)
    private readonly proveedorRepo: Repository<Proveedor>,
  ) { }

  async findAll(empresaId: number, page: number = 1, limit: number = 20, search?: string): Promise<{ data: Product[], total: number, page: number, limit: number }> {
    const safePage = Math.max(page, 1)
    const safeLimit = Math.max(limit, 1)
    const query = this.productRepo
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.tipoProducto', 'tipoProducto')
      .leftJoinAndSelect('producto.unidadMedida', 'unidadMedida')
      .leftJoinAndSelect('producto.proveedor', 'proveedor')
      .where('producto.empresa_id = :empresaId', { empresaId })
      .orderBy('producto.nombre', 'ASC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)

    if (search?.trim()) {
      const term = `%${search.trim()}%`
      query.andWhere(
        `(producto.nombre ILIKE :term
        OR producto.codigo_erp ILIKE :term
        OR producto.codigo_proveedor ILIKE :term
        OR producto.codigo_alimentacion ILIKE :term
        OR producto.proveedor_ultima_compra ILIKE :term
        OR proveedor.descripcion ILIKE :term)`,
        { term },
      )
    }

    const [data, total] = await query.getManyAndCount()
    return { data, total, page: safePage, limit: safeLimit }
  }

  async findOne(empresaId: number, id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id, empresaId },
      relations: { tipoProducto: true, unidadMedida: true, proveedor: true },
    })

    if (!product) {
      throw new NotFoundException('Producto no encontrado')
    }

    return product
  }

  async getCatalogos(empresaId: number): Promise<{ tiposProducto: TipoProducto[], unidadesMedida: UnidadMedida[], proveedores: Proveedor[] }> {
    const [tiposProducto, unidadesMedida, proveedores] = await Promise.all([
      this.tipoProductoRepo.find({ where: { empresaId }, order: { descripcion: 'ASC' } }),
      this.unidadMedidaRepo.find({ where: { empresaId }, order: { descripcion: 'ASC' } }),
      this.proveedorRepo.find({ where: { empresaId }, order: { descripcion: 'ASC' } }),
    ])

    return { tiposProducto, unidadesMedida, proveedores }
  }

  async findAllTiposProducto(empresaId: number): Promise<TipoProducto[]> {
    return this.tipoProductoRepo.find({ where: { empresaId }, order: { descripcion: 'ASC' } })
  }

  async findOneTipoProducto(empresaId: number, id: number): Promise<TipoProducto> {
    const tipoProducto = await this.tipoProductoRepo.findOne({ where: { id, empresaId } })
    if (!tipoProducto) {
      throw new NotFoundException('Tipo de producto no encontrado')
    }

    return tipoProducto
  }

  async createTipoProducto(empresaId: number, dto: CreateCatalogDto): Promise<TipoProducto> {
    const tipoProducto = this.tipoProductoRepo.create({ ...dto, empresaId })
    return this.tipoProductoRepo.save(tipoProducto)
  }

  async updateTipoProducto(empresaId: number, id: number, dto: UpdateCatalogDto): Promise<TipoProducto> {
    const tipoProducto = await this.findOneTipoProducto(empresaId, id)
    Object.assign(tipoProducto, dto)
    return this.tipoProductoRepo.save(tipoProducto)
  }

  async removeTipoProducto(empresaId: number, id: number): Promise<void> {
    const tipoProducto = await this.findOneTipoProducto(empresaId, id)
    await this.tipoProductoRepo.remove(tipoProducto)
  }

  async findAllUnidadesMedida(empresaId: number): Promise<UnidadMedida[]> {
    return this.unidadMedidaRepo.find({ where: { empresaId }, order: { descripcion: 'ASC' } })
  }

  async findOneUnidadMedida(empresaId: number, id: number): Promise<UnidadMedida> {
    const unidadMedida = await this.unidadMedidaRepo.findOne({ where: { id, empresaId } })
    if (!unidadMedida) {
      throw new NotFoundException('Unidad de medida no encontrada')
    }

    return unidadMedida
  }

  async createUnidadMedida(empresaId: number, dto: CreateCatalogDto): Promise<UnidadMedida> {
    const unidadMedida = this.unidadMedidaRepo.create({ ...dto, empresaId })
    return this.unidadMedidaRepo.save(unidadMedida)
  }

  async updateUnidadMedida(empresaId: number, id: number, dto: UpdateCatalogDto): Promise<UnidadMedida> {
    const unidadMedida = await this.findOneUnidadMedida(empresaId, id)
    Object.assign(unidadMedida, dto)
    return this.unidadMedidaRepo.save(unidadMedida)
  }

  async removeUnidadMedida(empresaId: number, id: number): Promise<void> {
    const unidadMedida = await this.findOneUnidadMedida(empresaId, id)
    await this.unidadMedidaRepo.remove(unidadMedida)
  }

  async findAllProveedores(empresaId: number): Promise<Proveedor[]> {
    return this.proveedorRepo.find({ where: { empresaId }, order: { descripcion: 'ASC' } })
  }

  async findOneProveedor(empresaId: number, id: number): Promise<Proveedor> {
    const proveedor = await this.proveedorRepo.findOne({ where: { id, empresaId } })
    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado')
    }

    return proveedor
  }

  async createProveedor(empresaId: number, dto: CreateCatalogDto): Promise<Proveedor> {
    const descripcion = dto.descripcion?.trim()
    const rfc = dto.rfc?.trim()

    if (!descripcion || !rfc) {
      throw new BadRequestException('Descripcion y RFC son obligatorios')
    }

    const proveedor = this.proveedorRepo.create({ descripcion, rfc, empresaId })
    return this.proveedorRepo.save(proveedor)
  }

  async updateProveedor(empresaId: number, id: number, dto: UpdateCatalogDto): Promise<Proveedor> {
    const proveedor = await this.findOneProveedor(empresaId, id)

    if (dto.descripcion !== undefined) {
      proveedor.descripcion = dto.descripcion.trim()
    }

    if (dto.rfc !== undefined) {
      proveedor.rfc = dto.rfc.trim()
    }

    return this.proveedorRepo.save(proveedor)
  }

  async removeProveedor(empresaId: number, id: number): Promise<void> {
    const proveedor = await this.findOneProveedor(empresaId, id)
    await this.proveedorRepo.remove(proveedor)
  }

  async create(empresaId: number, createProductDto: CreateProductDto): Promise<Product> {
    await this.validarCatalogos(
      empresaId,
      createProductDto.tipoProductoId,
      createProductDto.unidadMedidaId,
      createProductDto.proveedorId,
    )

    const product = this.productRepo.create({
      ...this.normalizePayload(createProductDto),
      empresaId,
      division: 1,
    })
    const saved = await this.productRepo.save(product)
    return this.findOne(empresaId, saved.id)
  }

  async update(empresaId: number, id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id, empresaId } })
    if (!product) {
      throw new NotFoundException('Producto no encontrado')
    }

    await this.validarCatalogos(
      empresaId,
      updateProductDto.tipoProductoId ?? product.tipoProductoId,
      updateProductDto.unidadMedidaId ?? product.unidadMedidaId,
      updateProductDto.proveedorId ?? product.proveedorId,
    )

    Object.assign(product, this.normalizePayload(updateProductDto), { division: 1 })
    await this.productRepo.save(product)
    return this.findOne(empresaId, id)
  }

  async remove(empresaId: number, id: number): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id, empresaId } })
    if (!product) {
      throw new NotFoundException('Producto no encontrado')
    }

    await this.productRepo.remove(product)
  }

  async seedData(empresaId: number): Promise<void> {
    await this.productRepo.delete({ empresaId })
    await this.tipoProductoRepo.delete({ empresaId })
    await this.unidadMedidaRepo.delete({ empresaId })
    await this.proveedorRepo.delete({ empresaId })

    const tiposProducto = await this.tipoProductoRepo.save([
      { descripcion: 'Materia prima', empresaId },
      { descripcion: 'Insumo', empresaId },
      { descripcion: 'Producto terminado', empresaId },
    ])

    const unidadesMedida = await this.unidadMedidaRepo.save([
      { descripcion: 'Kilogramo', empresaId },
      { descripcion: 'Litro', empresaId },
      { descripcion: 'Pieza', empresaId },
    ])

    const proveedores = await this.proveedorRepo.save([
      { descripcion: 'Lácteos del Norte', rfc: 'LNT850101ABC', empresaId },
      { descripcion: 'AgroSuministros', rfc: 'AGR920202DEF', empresaId },
      { descripcion: 'Distribuidora Lechera', rfc: 'DLE770303GHI', empresaId },
    ])

    await this.productRepo.save([
      {
        nombre: 'Leche entera fresca',
        empresaId,
        tipoProductoId: tiposProducto[2].id,
        division: 1,
        proveedorId: proveedores[0].id,
        proveedorUltimaCompra: 'OC-1001',
        codigoErp: 'ERP-LEC-001',
        codigoProveedor: 'PROV-LEC-001',
        codigoAlimentacion: 'ALIM-LEC-001',
        unidadMedidaId: unidadesMedida[1].id,
      },
      {
        nombre: 'Alimento concentrado 18%',
        empresaId,
        tipoProductoId: tiposProducto[1].id,
        division: 1,
        proveedorId: proveedores[1].id,
        proveedorUltimaCompra: 'OC-2001',
        codigoErp: 'ERP-ALI-018',
        codigoProveedor: 'PROV-ALI-018',
        codigoAlimentacion: 'ALIM-CON-018',
        unidadMedidaId: unidadesMedida[0].id,
      },
      {
        nombre: 'Queso fresco',
        empresaId,
        tipoProductoId: tiposProducto[2].id,
        division: 1,
        proveedorId: proveedores[2].id,
        proveedorUltimaCompra: 'OC-1002',
        codigoErp: 'ERP-QUE-001',
        codigoProveedor: 'PROV-QUE-001',
        codigoAlimentacion: 'ALIM-QUE-001',
        unidadMedidaId: unidadesMedida[0].id,
      },
      {
        nombre: 'Cultivo lactico',
        empresaId,
        tipoProductoId: tiposProducto[0].id,
        division: 1,
        proveedorId: proveedores[1].id,
        proveedorUltimaCompra: 'OC-3001',
        codigoErp: 'ERP-CUL-001',
        codigoProveedor: 'PROV-CUL-001',
        codigoAlimentacion: 'ALIM-CUL-001',
        unidadMedidaId: unidadesMedida[2].id,
      },
      {
        nombre: 'Yogurt natural',
        empresaId,
        tipoProductoId: tiposProducto[2].id,
        division: 1,
        proveedorId: proveedores[0].id,
        proveedorUltimaCompra: 'OC-1003',
        codigoErp: 'ERP-YOG-001',
        codigoProveedor: 'PROV-YOG-001',
        codigoAlimentacion: 'ALIM-YOG-001',
        unidadMedidaId: unidadesMedida[1].id,
      },
    ])
  }

  private async validarCatalogos(empresaId: number, tipoProductoId: number, unidadMedidaId: number, proveedorId: number) {
    const [tipoProducto, unidadMedida, proveedor] = await Promise.all([
      this.tipoProductoRepo.findOne({ where: { id: tipoProductoId, empresaId } }),
      this.unidadMedidaRepo.findOne({ where: { id: unidadMedidaId, empresaId } }),
      this.proveedorRepo.findOne({ where: { id: proveedorId, empresaId } }),
    ])

    if (!tipoProducto) {
      throw new NotFoundException('Tipo de producto no encontrado')
    }

    if (!unidadMedida) {
      throw new NotFoundException('Unidad de medida no encontrada')
    }

    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado')
    }
  }

  private normalizePayload<T extends CreateProductDto | UpdateProductDto>(payload: T): T {
    return {
      ...payload,
      nombre: payload.nombre?.trim(),
      proveedorUltimaCompra: payload.proveedorUltimaCompra?.trim(),
      codigoErp: payload.codigoErp?.trim(),
      codigoProveedor: payload.codigoProveedor?.trim(),
      codigoAlimentacion: payload.codigoAlimentacion?.trim(),
    }
  }
}
