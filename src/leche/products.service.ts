import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, ILike } from 'typeorm'
import { Product } from './product.entity'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) { }

  async findAll(page: number = 1, limit: number = 20, search?: string): Promise<{ data: Product[], total: number, page: number, limit: number }> {
    const skip = (page - 1) * limit

    const whereCondition = search ? [
      { nombre: ILike(`%${search}%`), estatus: true },
      { clave: ILike(`%${search}%`), estatus: true },
    ] : { estatus: true }

    const [data, total] = await this.productRepo.findAndCount({
      where: whereCondition,
      order: { nombre: 'ASC' },
      skip,
      take: limit,
    })

    return { data, total, page, limit }
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id, estatus: true }
    })
    if (!product) {
      throw new NotFoundException('Producto no encontrado')
    }
    return product
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Verificar si la clave ya existe
    const existingProduct = await this.productRepo.findOne({
      where: { clave: createProductDto.clave }
    })
    if (existingProduct) {
      throw new ConflictException('La clave del producto ya existe')
    }

    const product = this.productRepo.create({
      ...createProductDto,
      estatus: createProductDto.estatus ?? true,
    })
    return this.productRepo.save(product)
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } })
    if (!product) {
      throw new NotFoundException('Producto no encontrado')
    }

    // Si se está actualizando la clave, verificar que no exista
    if (updateProductDto.clave && updateProductDto.clave !== product.clave) {
      const existingProduct = await this.productRepo.findOne({
        where: { clave: updateProductDto.clave }
      })
      if (existingProduct) {
        throw new ConflictException('La clave del producto ya existe')
      }
    }

    Object.assign(product, updateProductDto)
    return this.productRepo.save(product)
  }

  async remove(id: number): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id } })
    if (!product) {
      throw new NotFoundException('Producto no encontrado')
    }

    // Soft delete: cambiar estatus a false
    product.estatus = false
    await this.productRepo.save(product)
  }

  async generarClave(): Promise<string> {
    const productos = await this.productRepo.find({
      order: { id: 'DESC' },
      take: 1,
    })

    const ultimoId = productos.length > 0 ? productos[0].id : 0
    const nuevaClave = `PROD${(ultimoId + 1).toString().padStart(4, '0')}`
    return nuevaClave
  }

  async seedData(): Promise<void> {
    const productosMock = [
      // Lácteos
      { nombre: 'Leche Entera Fresca', clave: 'LECH001', categoria: 'Lácteos', precio: 24.50, unidad: 'Litro', descripcion: 'Leche entera fresca de alta calidad', stock: 150, codigoBarras: '7501234567890' },
      { nombre: 'Leche Deslactosada', clave: 'LECH002', categoria: 'Lácteos', precio: 22.75, unidad: 'Litro', descripcion: 'Leche sin lactosa', stock: 120, codigoBarras: '7501234567891' },
      { nombre: 'Leche Light', clave: 'LECH003', categoria: 'Lácteos', precio: 21.00, unidad: 'Litro', descripcion: 'Leche baja en grasa', stock: 95, codigoBarras: '7501234567892' },
      { nombre: 'Queso Oaxaca', clave: 'QUES001', categoria: 'Lácteos', precio: 89.90, unidad: 'Kilo', descripcion: 'Queso Oaxaca tradicional', stock: 45, codigoBarras: '7501234567893' },
      { nombre: 'Queso Manchego', clave: 'QUES002', categoria: 'Lácteos', precio: 125.50, unidad: 'Kilo', descripcion: 'Queso Manchego curado', stock: 30, codigoBarras: '7501234567894' },
      { nombre: 'Queso Panela', clave: 'QUES003', categoria: 'Lácteos', precio: 78.00, unidad: 'Kilo', descripcion: 'Queso fresco panela', stock: 55, codigoBarras: '7501234567895' },
      { nombre: 'Yogurt Natural', clave: 'YOGU001', categoria: 'Lácteos', precio: 18.75, unidad: 'Litro', descripcion: 'Yogurt natural sin azúcar', stock: 80, codigoBarras: '7501234567896' },
      { nombre: 'Yogurt Fresa', clave: 'YOGU002', categoria: 'Lácteos', precio: 20.50, unidad: 'Litro', descripcion: 'Yogurt con sabor a fresa', stock: 65, codigoBarras: '7501234567897' },
      { nombre: 'Mantequilla', clave: 'MANT001', categoria: 'Lácteos', precio: 45.00, unidad: 'Kilo', descripcion: 'Mantequilla pura de leche', stock: 60, codigoBarras: '7501234567898' },
      { nombre: 'Crema para Batir', clave: 'CREM001', categoria: 'Lácteos', precio: 32.50, unidad: 'Litro', descripcion: 'Crema para batir 35% grasa', stock: 35, codigoBarras: '7501234567899' },
      { nombre: 'Crema Agria', clave: 'CREM002', categoria: 'Lácteos', precio: 28.00, unidad: 'Litro', descripcion: 'Crema agria natural', stock: 40, codigoBarras: '7501234567900' },
      { nombre: 'Requesón', clave: 'REQU001', categoria: 'Lácteos', precio: 35.75, unidad: 'Kilo', descripcion: 'Requesón fresco', stock: 25, codigoBarras: '7501234567901' },

      // Cárnicos
      { nombre: 'Carne de Res Molida', clave: 'CARN001', categoria: 'Cárnicos', precio: 89.00, unidad: 'Kilo', descripcion: 'Carne de res molida premium', stock: 40, codigoBarras: '7501234567902' },
      { nombre: 'Pechuga de Pollo', clave: 'CARN002', categoria: 'Cárnicos', precio: 65.50, unidad: 'Kilo', descripcion: 'Pechuga de pollo sin hueso', stock: 75, codigoBarras: '7501234567903' },
      { nombre: 'Puerco en Trozos', clave: 'CARN003', categoria: 'Cárnicos', precio: 78.25, unidad: 'Kilo', descripcion: 'Carne de puerco en trozos', stock: 35, codigoBarras: '7501234567904' },
      { nombre: 'Chorizo de Res', clave: 'CARN004', categoria: 'Cárnicos', precio: 95.00, unidad: 'Kilo', descripcion: 'Chorizo artesanal de res', stock: 28, codigoBarras: '7501234567905' },
      { nombre: 'Jamón Cocido', clave: 'CARN005', categoria: 'Cárnicos', precio: 120.00, unidad: 'Kilo', descripcion: 'Jamón cocido premium', stock: 20, codigoBarras: '7501234567906' },

      // Panadería
      { nombre: 'Pan Blanco Bolsa', clave: 'PANI001', categoria: 'Panadería', precio: 35.00, unidad: 'Pieza', descripcion: 'Pan blanco de 500g', stock: 100, codigoBarras: '7501234567907' },
      { nombre: 'Pan Integral', clave: 'PANI002', categoria: 'Panadería', precio: 42.50, unidad: 'Pieza', descripcion: 'Pan integral de grano entero', stock: 65, codigoBarras: '7501234567908' },
      { nombre: 'Bolillos', clave: 'PANI003', categoria: 'Panadería', precio: 3.50, unidad: 'Pieza', descripcion: 'Bolillo tradicional', stock: 200, codigoBarras: '7501234567909' },
      { nombre: 'Conchas', clave: 'PANI004', categoria: 'Panadería', precio: 8.00, unidad: 'Pieza', descripcion: 'Concha de vainilla', stock: 85, codigoBarras: '7501234567910' },
      { nombre: 'Croissants', clave: 'PANI005', categoria: 'Panadería', precio: 15.00, unidad: 'Pieza', descripcion: 'Croissant de mantequilla', stock: 45, codigoBarras: '7501234567911' },

      // Frutas y Verduras
      { nombre: 'Manzanas Rojas', clave: 'FRUT001', categoria: 'Frutas', precio: 45.00, unidad: 'Kilo', descripcion: 'Manzanas frescas y crujientes', stock: 80, codigoBarras: '7501234567912' },
      { nombre: 'Plátanos', clave: 'FRUT002', categoria: 'Frutas', precio: 22.00, unidad: 'Kilo', descripcion: 'Plátanos maduros', stock: 120, codigoBarras: '7501234567913' },
      { nombre: 'Naranjas', clave: 'FRUT003', categoria: 'Frutas', precio: 18.50, unidad: 'Kilo', descripcion: 'Naranjas jugosas', stock: 95, codigoBarras: '7501234567914' },
      { nombre: 'Tomates', clave: 'VERD001', categoria: 'Verduras', precio: 25.00, unidad: 'Kilo', descripcion: 'Tomates rojos frescos', stock: 70, codigoBarras: '7501234567915' },
      { nombre: 'Lechuga', clave: 'VERD002', categoria: 'Verduras', precio: 12.00, unidad: 'Pieza', descripcion: 'Lechuga fresca', stock: 45, codigoBarras: '7501234567916' },
      { nombre: 'Cebollas Blancas', clave: 'VERD003', categoria: 'Verduras', precio: 18.00, unidad: 'Kilo', descripcion: 'Cebollas blancas', stock: 85, codigoBarras: '7501234567917' },
      { nombre: 'Zanahorias', clave: 'VERD004', categoria: 'Verduras', precio: 15.00, unidad: 'Kilo', descripcion: 'Zanahorias frescas', stock: 60, codigoBarras: '7501234567918' },

      // Bebidas
      { nombre: 'Agua Purificada', clave: 'BEBI001', categoria: 'Bebidas', precio: 10.00, unidad: 'Litro', descripcion: 'Agua purificada', stock: 150, codigoBarras: '7501234567919' },
      { nombre: 'Refresco de Cola', clave: 'BEBI002', categoria: 'Bebidas', precio: 15.50, unidad: 'Litro', descripcion: 'Refresco de cola', stock: 120, codigoBarras: '7501234567920' },
      { nombre: 'Jugo de Naranja', clave: 'BEBI003', categoria: 'Bebidas', precio: 28.00, unidad: 'Litro', descripcion: 'Jugo de naranja 100%', stock: 65, codigoBarras: '7501234567921' },
      { nombre: 'Té Helado', clave: 'BEBI004', categoria: 'Bebidas', precio: 18.00, unidad: 'Litro', descripcion: 'Té helado limón', stock: 80, codigoBarras: '7501234567922' },

      // Despensa
      { nombre: 'Arroz Blanco', clave: 'DESP001', categoria: 'Despensa', precio: 25.00, unidad: 'Kilo', descripcion: 'Arroz blanco grano largo', stock: 90, codigoBarras: '7501234567923' },
      { nombre: 'Frijoles Negros', clave: 'DESP002', categoria: 'Despensa', precio: 22.00, unidad: 'Kilo', descripcion: 'Frijoles negros refritos', stock: 75, codigoBarras: '7501234567924' },
      { nombre: 'Pasta Spaghetti', clave: 'DESP003', categoria: 'Despensa', precio: 18.50, unidad: 'Paquete', descripcion: 'Pasta spaghetti 500g', stock: 110, codigoBarras: '7501234567925' },
      { nombre: 'Aceite Vegetal', clave: 'DESP004', categoria: 'Despensa', precio: 45.00, unidad: 'Litro', descripcion: 'Aceite vegetal puro', stock: 55, codigoBarras: '7501234567926' },
      { nombre: 'Sal de Mesa', clave: 'DESP005', categoria: 'Despensa', precio: 12.00, unidad: 'Kilo', descripcion: 'Sal de mesa yodada', stock: 130, codigoBarras: '7501234567927' },
      { nombre: 'Azúcar Estándar', clave: 'DESP006', categoria: 'Despensa', precio: 28.00, unidad: 'Kilo', descripcion: 'Azúcar blanca refinada', stock: 95, codigoBarras: '7501234567928' },
      { nombre: 'Café Molido', clave: 'DESP007', categoria: 'Despensa', precio: 85.00, unidad: 'Kilo', descripcion: 'Café molido tostado', stock: 40, codigoBarras: '7501234567929' },
      { nombre: 'Harina de Maíz', clave: 'DESP008', categoria: 'Despensa', precio: 15.00, unidad: 'Kilo', descripcion: 'Harina de maíz para tortillas', stock: 85, codigoBarras: '7501234567930' },

      // Limpieza
      { nombre: 'Detergente en Polvo', clave: 'LIMP001', categoria: 'Limpieza', precio: 35.00, unidad: 'Caja', descripcion: 'Detergente para ropa 1kg', stock: 60, codigoBarras: '7501234567931' },
      { nombre: 'Cloro Blanca', clave: 'LIMP002', categoria: 'Limpieza', precio: 18.00, unidad: 'Litro', descripcion: 'Cloro blanca pura', stock: 85, codigoBarras: '7501234567932' },
      { nombre: 'Jabón Lavatrastos', clave: 'LIMP003', categoria: 'Limpieza', precio: 25.00, unidad: 'Pieza', descripcion: 'Jabón líquido para trastes', stock: 70, codigoBarras: '7501234567933' },
      { nombre: 'Limpiavidrios', clave: 'LIMP004', categoria: 'Limpieza', precio: 32.00, unidad: 'Litro', descripcion: 'Limpiavidrios con amoniaco', stock: 45, codigoBarras: '7501234567934' },

      // Personal
      { nombre: 'Shampoo Capilar', clave: 'PERS001', categoria: 'Personal', precio: 45.00, unidad: 'Botella', descripcion: 'Shampoo para cabello normal', stock: 55, codigoBarras: '7501234567935' },
      { nombre: 'Pasta Dental', clave: 'PERS002', categoria: 'Personal', precio: 28.00, unidad: 'Tubo', descripcion: 'Pasta dental menta fresca', stock: 80, codigoBarras: '7501234567936' },
      { nombre: 'Jabón de Tocador', clave: 'PERS003', categoria: 'Personal', precio: 15.00, unidad: 'Pieza', descripcion: 'Jabón de tocador antibacterial', stock: 120, codigoBarras: '7501234567937' },
      { nombre: 'Desodorante Roll-on', clave: 'PERS004', categoria: 'Personal', precio: 35.00, unidad: 'Pieza', descripcion: 'Desodorante roll-on', stock: 65, codigoBarras: '7501234567938' }
    ]

    for (const productoData of productosMock) {
      const existe = await this.productRepo.findOne({
        where: { clave: productoData.clave }
      })
      if (!existe) {
        const producto = this.productRepo.create(productoData)
        await this.productRepo.save(producto)
      }
    }
  }
}
