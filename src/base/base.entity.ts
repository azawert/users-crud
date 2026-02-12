import { CreateDateColumn, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export abstract class BaseEntity {
  @Index()
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ default: () => 'CURRENT_TIMESTAMP', type: 'timestamp' })
  updatedAt: Date
}
