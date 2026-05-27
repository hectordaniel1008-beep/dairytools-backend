import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Establo } from './establo.entity'
import { Dieta } from './dieta.entity'
import { Almacen } from './almacen.entity'
import { TipoSalidaLeche } from './tipo-salida-leche.entity'
import { Corral } from './corral.entity'
import { CreateCatalogoGeneralDto, UpdateCatalogoGeneralDto } from './dto/create-catalogo-general.dto'

@Injectable()
export class CatalogosGeneralesService {
    constructor(
        @InjectRepository(Establo)
        private readonly establosRepo: Repository<Establo>,
        @InjectRepository(Dieta)
        private readonly dietasRepo: Repository<Dieta>,
        @InjectRepository(Almacen)
        private readonly almacenesRepo: Repository<Almacen>,
        @InjectRepository(TipoSalidaLeche)
        private readonly tiposSalidaLecheRepo: Repository<TipoSalidaLeche>,
        @InjectRepository(Corral)
        private readonly corralesRepo: Repository<Corral>,
    ) { }

    async findAllEstablos(empresaId: number): Promise<Establo[]> {
        return this.establosRepo.find({ where: { empresaId }, order: { descripcion: 'ASC' } })
    }

    async findOneEstablo(empresaId: number, id: number): Promise<Establo> {
        const establo = await this.establosRepo.findOne({ where: { id, empresaId } })
        if (!establo) {
            throw new NotFoundException('Establo no encontrado')
        }
        return establo
    }

    async createEstablo(empresaId: number, dto: CreateCatalogoGeneralDto): Promise<Establo> {
        this.validateDescripcionAndNumero(dto)

        const establo = this.establosRepo.create({
            descripcion: dto.descripcion.trim(),
            numero: dto.numero?.trim() ?? '',
            empresaId,
        })

        return this.establosRepo.save(establo)
    }

    async updateEstablo(empresaId: number, id: number, dto: UpdateCatalogoGeneralDto): Promise<Establo> {
        const establo = await this.findOneEstablo(empresaId, id)

        if (dto.descripcion !== undefined) {
            establo.descripcion = dto.descripcion.trim()
        }

        if (dto.numero !== undefined) {
            establo.numero = dto.numero.trim()
        }

        return this.establosRepo.save(establo)
    }

    async removeEstablo(empresaId: number, id: number): Promise<void> {
        const establo = await this.findOneEstablo(empresaId, id)
        await this.establosRepo.remove(establo)
    }

    async findAllDietas(empresaId: number): Promise<Dieta[]> {
        return this.dietasRepo.find({ where: { empresaId }, order: { descripcion: 'ASC' } })
    }

    async findOneDieta(empresaId: number, id: number): Promise<Dieta> {
        const dieta = await this.dietasRepo.findOne({ where: { id, empresaId } })
        if (!dieta) {
            throw new NotFoundException('Dieta no encontrada')
        }
        return dieta
    }

    async createDieta(empresaId: number, dto: CreateCatalogoGeneralDto): Promise<Dieta> {
        this.validateDescripcion(dto)

        const dieta = this.dietasRepo.create({
            descripcion: dto.descripcion.trim(),
            empresaId,
        })

        return this.dietasRepo.save(dieta)
    }

    async updateDieta(empresaId: number, id: number, dto: UpdateCatalogoGeneralDto): Promise<Dieta> {
        const dieta = await this.findOneDieta(empresaId, id)

        if (dto.descripcion !== undefined) {
            dieta.descripcion = dto.descripcion.trim()
        }

        return this.dietasRepo.save(dieta)
    }

    async removeDieta(empresaId: number, id: number): Promise<void> {
        const dieta = await this.findOneDieta(empresaId, id)
        await this.dietasRepo.remove(dieta)
    }

    async findAllAlmacenes(empresaId: number): Promise<Almacen[]> {
        return this.almacenesRepo.find({ where: { empresaId }, order: { descripcion: 'ASC' } })
    }

    async findOneAlmacen(empresaId: number, id: number): Promise<Almacen> {
        const almacen = await this.almacenesRepo.findOne({ where: { id, empresaId } })
        if (!almacen) {
            throw new NotFoundException('Almacen no encontrado')
        }
        return almacen
    }

    async createAlmacen(empresaId: number, dto: CreateCatalogoGeneralDto): Promise<Almacen> {
        this.validateDescripcion(dto)

        const almacen = this.almacenesRepo.create({
            descripcion: dto.descripcion.trim(),
            empresaId,
        })

        return this.almacenesRepo.save(almacen)
    }

    async updateAlmacen(empresaId: number, id: number, dto: UpdateCatalogoGeneralDto): Promise<Almacen> {
        const almacen = await this.findOneAlmacen(empresaId, id)

        if (dto.descripcion !== undefined) {
            almacen.descripcion = dto.descripcion.trim()
        }

        return this.almacenesRepo.save(almacen)
    }

    async removeAlmacen(empresaId: number, id: number): Promise<void> {
        const almacen = await this.findOneAlmacen(empresaId, id)
        await this.almacenesRepo.remove(almacen)
    }

    async findAllTiposSalidaLeche(empresaId: number): Promise<TipoSalidaLeche[]> {
        return this.tiposSalidaLecheRepo.find({ where: { empresaId }, order: { descripcion: 'ASC' } })
    }

    async findOneTipoSalidaLeche(empresaId: number, id: number): Promise<TipoSalidaLeche> {
        const tipoSalida = await this.tiposSalidaLecheRepo.findOne({ where: { id, empresaId } })
        if (!tipoSalida) {
            throw new NotFoundException('Tipo de salida de leche no encontrado')
        }
        return tipoSalida
    }

    async createTipoSalidaLeche(empresaId: number, dto: CreateCatalogoGeneralDto): Promise<TipoSalidaLeche> {
        this.validateDescripcion(dto)

        const tipoSalida = this.tiposSalidaLecheRepo.create({
            descripcion: dto.descripcion.trim(),
            empresaId,
        })

        return this.tiposSalidaLecheRepo.save(tipoSalida)
    }

    async updateTipoSalidaLeche(empresaId: number, id: number, dto: UpdateCatalogoGeneralDto): Promise<TipoSalidaLeche> {
        const tipoSalida = await this.findOneTipoSalidaLeche(empresaId, id)

        if (dto.descripcion !== undefined) {
            tipoSalida.descripcion = dto.descripcion.trim()
        }

        return this.tiposSalidaLecheRepo.save(tipoSalida)
    }

    async removeTipoSalidaLeche(empresaId: number, id: number): Promise<void> {
        const tipoSalida = await this.findOneTipoSalidaLeche(empresaId, id)
        await this.tiposSalidaLecheRepo.remove(tipoSalida)
    }

    async findAllCorrales(empresaId: number): Promise<Corral[]> {
        return this.corralesRepo.find({
            where: { empresaId },
            relations: { establo: true },
            order: { descripcion: 'ASC' },
        })
    }

    async findOneCorral(empresaId: number, id: number): Promise<Corral> {
        const corral = await this.corralesRepo.findOne({
            where: { id, empresaId },
            relations: { establo: true },
        })

        if (!corral) {
            throw new NotFoundException('Corral no encontrado')
        }

        return corral
    }

    async createCorral(empresaId: number, dto: CreateCatalogoGeneralDto): Promise<Corral> {
        this.validateDescripcion(dto)

        if (!dto.establoId) {
            throw new BadRequestException('Id de establo es obligatorio')
        }

        const establo = await this.establosRepo.findOne({ where: { id: dto.establoId, empresaId } })
        if (!establo) {
            throw new NotFoundException('Establo no encontrado')
        }

        const corral = this.corralesRepo.create({
            descripcion: dto.descripcion.trim(),
            establoId: dto.establoId,
            empresaId,
        })

        await this.corralesRepo.save(corral)
        return this.findOneCorral(empresaId, corral.id)
    }

    async updateCorral(empresaId: number, id: number, dto: UpdateCatalogoGeneralDto): Promise<Corral> {
        const corral = await this.findOneCorral(empresaId, id)

        if (dto.descripcion !== undefined) {
            corral.descripcion = dto.descripcion.trim()
        }

        if (dto.establoId !== undefined) {
            const establo = await this.establosRepo.findOne({ where: { id: dto.establoId, empresaId } })
            if (!establo) {
                throw new NotFoundException('Establo no encontrado')
            }
            corral.establoId = dto.establoId
        }

        await this.corralesRepo.save(corral)
        return this.findOneCorral(empresaId, corral.id)
    }

    async removeCorral(empresaId: number, id: number): Promise<void> {
        const corral = await this.findOneCorral(empresaId, id)
        await this.corralesRepo.remove(corral)
    }

    private validateDescripcion(dto: { descripcion?: string }): void {
        if (!dto.descripcion?.trim()) {
            throw new BadRequestException('Descripcion es obligatoria')
        }
    }

    private validateDescripcionAndNumero(dto: { descripcion?: string; numero?: string }): void {
        this.validateDescripcion(dto)

        if (!dto.numero?.trim()) {
            throw new BadRequestException('Numero es obligatorio')
        }

        if (dto.numero.trim().length > 20) {
            throw new BadRequestException('Numero no debe exceder 20 caracteres')
        }
    }
}
