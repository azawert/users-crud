import Decimal from 'decimal.js'
import { BaseEntity } from 'src/base'
import { DEFAULT_PRECISION, DEFAULT_SCALE, ERole, MAX_DESCRIPTION_LENGTH } from 'src/common'
import { DecimalTransformer } from 'src/common/decimal.transformer'
import { Photo } from 'src/photo/photo.entity'
import { Column, DeleteDateColumn, Entity, Index, OneToMany } from 'typeorm'

const defaultBalance = 0.0
@Entity()
class User extends BaseEntity {
  @Column()
  login: string

  @Column()
  passwordHash: string

  @Column({ length: MAX_DESCRIPTION_LENGTH, nullable: true, type: 'char' })
  description: string

  @Index()
  @Column()
  age: number

  @Column()
  email: string

  @Column({ nullable: true })
  refreshToken: string

  @DeleteDateColumn({ default: null, nullable: true })
  deletedAt: Date

  @Column({ default: ERole.USER, enum: ERole, type: 'enum' })
  role: ERole

  @OneToMany(
    () => Photo,
    photo => photo.user,
    { cascade: true },
  )
  photos: Photo[]

  @Column({
    default: defaultBalance,
    precision: DEFAULT_PRECISION,
    scale: DEFAULT_SCALE,
    transformer: new DecimalTransformer(),
    type: 'decimal',
  })
  balance: Decimal
}

export default User
