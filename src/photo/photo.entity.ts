import { BaseEntity } from 'src/base'
import User from 'src/user/user.entity'
import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

@Entity()
export class Photo extends BaseEntity {
  @DeleteDateColumn({ default: null, nullable: true })
  deletedAt: Date

  @Column()
  url: string

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User

  @Index()
  @Column({ name: 'user_id' })
  userId: number
}
