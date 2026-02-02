import { BaseEntity } from 'src/base'
import { ERole, MAX_DESCRIPTION_LENGTH } from 'src/common'
import { Column, DeleteDateColumn, Entity } from 'typeorm'

@Entity()
class User extends BaseEntity {
	@Column()
	login: string

	@Column()
	passwordHash: string

	@Column({ nullable: true, length: MAX_DESCRIPTION_LENGTH, type: 'char' })
	description: string

	@Column()
	age: number

	@Column()
	email: string

	@Column({ nullable: true })
	refreshToken: string

	@DeleteDateColumn({ nullable: true, default: null })
	deletedAt: Date

	@Column({ enum: ERole, type: 'enum', default: ERole.USER })
	role: ERole
}

export default User