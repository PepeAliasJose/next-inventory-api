export type column = {
  name: string
  type: 'int' | 'decimal' | 'string' | 'boolean' | 'datetime'
  nullable: boolean
  default: string | boolean | number | Date
}

export type userToken = {
  userId: string
  admin: boolean
  iat: number
  exp: number
  error: string
}
