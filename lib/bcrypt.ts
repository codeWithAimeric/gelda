import bcrypt from 'bcrypt'

export const hash = (unhashedText: string, salt: string) => bcrypt.hash(unhashedText, salt)

export const compare = (unhashedText: string, hashedText: string) =>
  bcrypt.compare(unhashedText, hashedText)

export const generateSalt = () => bcrypt.genSalt(10)
