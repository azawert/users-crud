import { BaseEntity } from 'src/base'
import { ERole, MAX_DESCRIPTION_LENGTH } from 'src/common'
import { Photo } from 'src/photo/photo.entity'
import { Column, DeleteDateColumn, Entity, Index, OneToMany } from 'typeorm'

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
}

export default User
