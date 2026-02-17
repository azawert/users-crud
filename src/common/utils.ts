import * as bcrypt from 'bcrypt'
import { DEFAULT_SALT } from './constants'

export const hashPassword = async (valueToHash: string, salt = DEFAULT_SALT): Promise<string> => {
  const hashedPassword = await bcrypt.hash(valueToHash, salt)

  return hashedPassword
}

export const comparePassword = async (value: string, valueToCompare: string): Promise<boolean> => {
  return bcrypt.compare(value, valueToCompare)
}
