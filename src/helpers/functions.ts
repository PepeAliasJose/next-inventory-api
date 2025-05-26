import { isBooleanObject, isDate, isStringObject } from 'util/types'
import { errors } from './errors'
import { column, userToken } from './types'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { prisma } from './conection'

/**
 * Renames a key in a JSON list
 */
export function renameKey (
  obj: { [k: string]: string },
  oldKey: string,
  newKey: string
) {
  obj[newKey] = obj[oldKey]
  delete obj[oldKey]
}

/**
 * Group a list into a json given the key
 *
 * @param obj object with an array of objects
 * @param groupedKey key name of the value you want to group the list of objects
 *
 * @returns a grouped JSON for the specified key name
 */
export function groupList (obj: { [k: string]: string }[], groupedKey: string) {
  let res: { [k: string]: {}[] } = {}
  obj.forEach(item => {
    const val = item[groupedKey]
    if (res[val]) {
      delete item[groupedKey]
      res[val].push(item)
    } else {
      delete item[groupedKey]
      res[val] = [item]
    }
  })
  return res
}

/**
 * @param column column data to validate
 *
 * @returns true for a valid column, false for a non valid column
 */
export function validateColumn (column: column): boolean {
  const typeValues = ['int', 'decimal', 'string', 'boolean', 'datetime']
  const typeParsers = [
    checkNumber,
    checkNumber,
    checkString,
    checkBoolean,
    checkDate
  ]
  if (!validateString(column.name)) {
    throw new Error(errors.E104)
  }
  const typeIndex = typeValues.indexOf(column.type)
  if (typeIndex == -1) {
    throw new Error(errors.E105)
  }
  if (typeof column.nullable != 'boolean') {
    throw new Error(errors.E106)
  }
  if (
    column.default != null &&
    !typeParsers[typeIndex](column.default as string)
  ) {
    throw new Error(errors.E107)
  }
  return true
}

function checkNumber (val: string) {
  return !isNaN((val as unknown as number) - 1)
}
function checkString (val: string) {
  console.log(new String(val))
  return isStringObject(new String(val))
}
function checkBoolean (val: string | boolean) {
  return isBooleanObject(new Boolean(val))
}
function checkDate (val: string) {
  const d = new Date(val)
  return !isNaN(d.getDate())
}

/**
 * This function does nothing
 * @param any
 * @return the input value
 */
export function none (val: any) {
  return val
}

/**
 *
 * Parse datetime to MySQL string
 * @param date string of date to be converted and parsed (timestamp)
 *
 * @return a string with the date in MySQL format
 *
 */
export function parseDate (date: string) {
  if (date) {
    const d = new Date(parseInt(date))
    return d.toISOString().replace('Z', '').replace('T', ' ')
  }
  return null
}

/**
 *
 * Parse bool to MySQL boolean
 * @param bool string of boolean to be converted and parsed
 *
 * @return a string with the boolean in MySQL format
 *
 */
export function parseBoolean (bool: string | boolean) {
  return Boolean(bool) ? '1' : '0'
}

/**
 *
 * Test for special characters
 * @param value string for validation
 *
 * @returns true if the string pass the filter, false otherwise
 *
 */
export function validateString (value: string): boolean {
  //Hacer el regex
  const regexp = new RegExp('^[a-zA-Z_&]+$')
  return regexp.test(value)
}

export async function validateSessionToken (token: string) {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as userToken
    if (!decoded) {
      return { error: errors.E402 }
    } else if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return { error: errors.E402 }
    } else {
      // SI es valido devolver los datos.
      return decoded
    }
  } catch (error) {
    //Lanza una excepcion cuando no es valido
    return { error: errors.E402 }
  }
}

/**
 *
 * Execute a function if the data contains a valid token with admin auth
 *
 * @param data any data received with a token parameter
 * @param func the function to execute
 *
 * @return NextReponse
 *
 */
export async function executeWithAuthAdmin (
  data: any,
  func: (data: any) => Promise<NextResponse>
) {
  if (data.token) {
    const userToken = (await validateSessionToken(data.token)) as userToken
    //Si esta mal devolver el error
    if (userToken.error) {
      return NextResponse.json({ error: userToken.error }, { status: 403 })
    } else if (userToken.admin) {
      //Comprobar si es admin

      //Comprobar si el usuario sigue existiendo
      const test = await prisma.users.findUnique({
        where: { id: parseInt(userToken.userId) },
        select: { name: true, email: true, admin: true, id: true }
      })

      if (test == null) {
        return NextResponse.json({ error: errors.E405 }, { status: 403 })
      }

      return func(data)
    } else {
      return NextResponse.json({ error: errors.E404 }, { status: 402 })
    }
  } else {
    return NextResponse.json({ error: errors.E401 }, { status: 403 })
  }
}

/**
 *
 * Execute a function if the data contains a valid token
 *
 * @param data any data received with a token parameter
 * @param func the function to execute
 *
 * @return NextReponse
 *
 */
export async function executeWithAuth (
  data: any,
  func: (data: any) => Promise<NextResponse>
) {
  if (data.token) {
    const userToken = (await validateSessionToken(data.token)) as userToken
    //Si esta mal devolver el error
    if (userToken.error) {
      return NextResponse.json({ error: userToken.error }, { status: 403 })
    } else {
      //Comprobar si existe el usuario
      const test = await prisma.users.findUnique({
        where: { id: parseInt(userToken.userId) },
        select: { name: true, email: true, admin: true, id: true }
      })

      if (test == null) {
        return NextResponse.json({ error: errors.E405 }, { status: 403 })
      }
      return func(data)
    }
  } else {
    return NextResponse.json({ error: errors.E401 }, { status: 403 })
  }
}
