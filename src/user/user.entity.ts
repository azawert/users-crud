import { BaseEntity } from 'src/base'
import { Column, DeleteDateColumn, Entity } from 'typeorm'

@Entity()
class User extends BaseEntity {
	@Column()
	login: string

	@Column()
	passwordHash: string

	@Column({ nullable: true, length: 1000, type: 'char' })
	description: string

	@Column()
	age: number

	@Column()
	email: string

	@Column({ nullable: true })
	refreshToken: string

	@DeleteDateColumn({ nullable: true, default: null })
	deletedAt: Date
}

export default User