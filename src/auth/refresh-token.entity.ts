import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm'
import { User } from '../users/user.entity'

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'usuario_id' })
  usuarioId: number

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: User

  @Column({ length: 128, unique: true })
  token: string                    // SHA-256 del token real

  @Column({ name: 'expira_en' })
  expiraEn: Date

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn: Date
}
