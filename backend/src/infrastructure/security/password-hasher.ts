import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64

export interface PasswordHasher {
  hash(password: string): Promise<string>
  verify(password: string, encodedPassword: string): Promise<boolean>
}

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex')
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
    return `scrypt$${salt}$${derivedKey.toString('hex')}`
  }

  async verify(password: string, encodedPassword: string): Promise<boolean> {
    const [scheme, salt, expectedHash] = encodedPassword.split('$')

    if (scheme !== 'scrypt' || !salt || !expectedHash) {
      return false
    }

    const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
    const expectedBuffer = Buffer.from(expectedHash, 'hex')

    if (derivedKey.length !== expectedBuffer.length) {
      return false
    }

    return timingSafeEqual(derivedKey, expectedBuffer)
  }
}
