import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Product } from './product.entity'
import { TipoProducto } from './tipo-producto.entity'
import { UnidadMedida } from './unidad-medida.entity'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(TipoProducto)
    private readonly tipoProductoRepo: Repository<TipoProducto>,
    @InjectRepository(UnidadMedida)
    private readonly unidadMedidaRepo: Repository<UnidadMedida>,
  ) { }

  async findAll(page: number = 1, limit: number = 20, search?: string): Promise<{ data: Product[], total: number, page: number, limit: number }> {
    const safePage = Math.max(page, 1)
    const safeLimit = Math.max(limit, 1)
    const query = this.productRepo
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.tipoProducto', 'tipoProducto')
      .leftJoinAndSelect('producto.unidadMedida', 'unidadMedida')
      .orderBy('producto.nombre', 'ASC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit)

    if (search?.trim()) {
      const term = `%${search.trim()}%`
      query.where(
        `producto.nombre ILIKE :term
        OR producto.codigoErp ILIKE :term
        OR producto.codigoProveedor ILIKE :term
        OR producto.codigoAlimentacion ILIKE :term`,
        { term },
      )
    }

    const [data, total] = await query.getManyAndCount()
    return { data, total, page: safePage, limit: safeLimit }
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: { tipoProducto: true, unidadMedida: true },
    })

    if (!product) {
      throw new NotFoundException('Producto no encontrado')
    }

    return product
  }

  async getCatalogos(): Promise<{ tiposProducto: TipoProducto[], unidadesMedida: UnidadMedida[] }> {
    const [tiposProducto, unidadesMedida] = await Promise.all([
      this.tipoProductoRepo.find({ order: { descripcion: 'ASC' } }),
      this.unidadMedidaRepo.find({ order: { descripcion: 'ASC' } }),
    ])

    return { tiposProducto, unidadesMedida }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    await this.validarCatalogos(createProductDto.tipoProductoId, createProductDto.unidadMedidaId)

    const product = this.productRepo.create(this.normalizePayload(createProductDto))
    const saved = await this.productRepo.save(product)
    return this.findOne(saved.id)
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } })
    if (!product) {
      throw new NotFoundException('Producto no encontrado')
    }

    await this.validarCatalogos(
      updateProductDto.tipoProductoId ?? product.tipoProductoId,
      updateProductDto.unidadMedidaId ?? product.unidadMedidaId,
    )

    Object.assign(product, this.normalizePayload(updateProductDto))
    await this.productRepo.save(product)
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id } })
    if (!product) {
      throw new NotFoundException('Producto no encontrado')
    }

    await this.productRepo.remove(product)
  }

  async seedData(): Promise<void> {
    await this.productRepo.createQueryBuilder().delete().execute()
    await this.tipoProductoRepo.createQueryBuilder().delete().execute()
    await this.unidadMedidaRepo.createQueryBuilder().delete().execute()

    const tiposProducto = await this.tipoProductoRepo.save([
      { descripcion: 'Materia prima' },
      { descripcion: 'Insumo' },
      { descripcion: 'Producto terminado' },
    ])

    const unidadesMedida = await this.unidadMedidaRepo.save([
      { descripcion: 'Kilogramo' },
      { descripcion: 'Litro' },
      { descripcion: 'Pieza' },
    ])

    await this.productRepo.save([
      {
        nombre: 'Leche entera fresca',
        tipoProductoId: tiposProducto[2].id,
        division: 1,
        proveedorUltimaCompra: 1001,
        codigoErp: 'ERP-LEC-001',
        codigoProveedor: 'PROV-LEC-001',
        codigoAlimentacion: 'ALIM-LEC-001',
        unidadMedidaId: unidadesMedida[1].id,
      },
      {
        nombre: 'Alimento concentrado 18%',
        tipoProductoId: tiposProducto[1].id,
        division: 2,
        proveedorUltimaCompra: 2001,
        codigoErp: 'ERP-ALI-018',
        codigoProveedor: 'PROV-ALI-018',
        codigoAlimentacion: 'ALIM-CON-018',
        unidadMedidaId: unidadesMedida[0].id,
      },
      {
        nombre: 'Queso fresco',
        tipoProductoId: tiposProducto[2].id,
        division: 1,
        proveedorUltimaCompra: 1002,
        codigoErp: 'ERP-QUE-001',
        codigoProveedor: 'PROV-QUE-001',
        codigoAlimentacion: 'ALIM-QUE-001',
        unidadMedidaId: unidadesMedida[0].id,
      },
      {
        nombre: 'Cultivo lactico',
        tipoProductoId: tiposProducto[0].id,
        division: 3,
        proveedorUltimaCompra: 3001,
        codigoErp: 'ERP-CUL-001',
        codigoProveedor: 'PROV-CUL-001',
        codigoAlimentacion: 'ALIM-CUL-001',
        unidadMedidaId: unidadesMedida[2].id,
      },
      {
        nombre: 'Yogurt natural',
        tipoProductoId: tiposProducto[2].id,
        division: 1,
        proveedorUltimaCompra: 1003,
        codigoErp: 'ERP-YOG-001',
        codigoProveedor: 'PROV-YOG-001',
        codigoAlimentacion: 'ALIM-YOG-001',
        unidadMedidaId: unidadesMedida[1].id,
      },
    ])
  }

  private async validarCatalogos(tipoProductoId: number, unidadMedidaId: number) {
    const [tipoProducto, unidadMedida] = await Promise.all([
      this.tipoProductoRepo.findOne({ where: { id: tipoProductoId } }),
      this.unidadMedidaRepo.findOne({ where: { id: unidadMedidaId } }),
    ])

    if (!tipoProducto) {
      throw new NotFoundException('Tipo de producto no encontrado')
    }

    if (!unidadMedida) {
      throw new NotFoundException('Unidad de medida no encontrada')
    }
  }

  private normalizePayload<T extends CreateProductDto | UpdateProductDto>(payload: T): T {
    return {
      ...payload,
      nombre: payload.nombre?.trim(),
      codigoErp: payload.codigoErp?.trim(),
      codigoProveedor: payload.codigoProveedor?.trim(),
      codigoAlimentacion: payload.codigoAlimentacion?.trim(),
    }
  }
}
