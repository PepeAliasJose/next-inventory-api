export type AddCategory = {
  token: string
  category_name: string
  type: string
  columns: column[]
}

export type column = {
  name: string
  type: 'int' | 'decimal' | 'string' | 'boolean' | 'datetime'
  nullable: boolean
  default: string | boolean | number | Date
}

export type EditCategory = {
  category_id: number
  new_name: string
  new_type: number
}

export type AddEntity = {
  token: string
  category_id: string
  name: string
  data: {}
}

export type userToken = {
  userId: string
  admin: boolean
  iat: number
  exp: number
  error: string
}
