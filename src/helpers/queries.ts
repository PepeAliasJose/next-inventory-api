import { column } from './types'
import { none, parseBoolean, parseDate } from './functions'

const typeValues = ['int', 'decimal', 'string', 'boolean', 'datetime']
const typeFunctions = [none, none, none, parseBoolean, parseDate]
const typeSQL = ['INT', 'FLOAT(4)', 'VARCHAR(255)', 'BOOL', 'DATETIME']
const notNull = 'NOT NULL'

export function createCategory (categoryName: string) {
  return `CREATE TABLE \`${categoryName}\` 
    (  \`id\` int NOT NULL AUTO_INCREMENT, 
     \`entity_id\` int NOT NULL UNIQUE, 
      PRIMARY KEY (\`id\`),  UNIQUE KEY \`id\` (\`id\`))`
}

export function createColumn (tableName: string, column: column) {
  let query = `ALTER TABLE \`${tableName}\` 
    ADD COLUMN \`${column.name.toLowerCase()}\` ${
    typeSQL[typeValues.indexOf(column.type)]
  } ${column.nullable ? '' : notNull} 
    DEFAULT \'${typeFunctions[typeValues.indexOf(column.type)](
      column.default as string
    )}\'`
  //console.log(query)
  return query
}

export function createColumns (tableName: string, columns: column[]) {
  let query = `ALTER TABLE \`${tableName}\` `

  for (let x = 0; x < columns.length; x++) {
    const def = `DEFAULT \'${typeFunctions[typeValues.indexOf(columns[x].type)](
      columns[x].default as string
    )}\'`

    query += `ADD COLUMN \`${columns[x].name.toLowerCase()}\` ${
      typeSQL[typeValues.indexOf(columns[x].type)]
    } ${columns[x].nullable ? '' : notNull} ${
      columns[x].default !== null ? def : ''
    },`
  }

  //console.log(query.substring(0, query.length - 1))
  return query.substring(0, query.length - 1)
}

export function createView (categoryName: string) {
  return `CREATE view \`${categoryName}_view\` AS  ( SELECT * FROM \`${categoryName}\` )`
}

/**
 *
 */
export function insertIntoCat (
  tableName: string,
  objectId: number,
  data: {} = {}
) {
  let insert = `INSERT INTO \`${tableName}\` (?) `
  let values = 'VALUES (?)'
  const dataKeys = Object.keys(data).map(x => {
    return '`' + x + '`'
  })
  dataKeys.push('`entity_id`')

  const dataValues = Object.values(data).map(x => {
    return "'" + x + "'"
  })
  dataValues.push("'" + objectId.toString() + "'")
  return (
    insert.replace('?', dataKeys.join(', ')) +
    values.replace('?', dataValues.join(', '))
  )
}

/**
 *
 */
export function updateIntoCat (
  tableName: string,
  objectId: number,
  data: any = { null: true }
) {
  let update = `UPDATE \`${tableName}\` SET ? `
  const where = `WHERE entity_id = ${objectId}`

  const dataKeys = Object.keys(data).map(x => {
    return '`' + x + '`'
  })
  const dataValues = Object.values(data).map(x => {
    return "'" + x + "'"
  })

  let values = []
  for (let x = 0; x < dataKeys.length; x++) {
    values.push(dataKeys[x] + ' = ' + dataValues[x])
  }

  return data.null ? null : update.replace('?', values.join(', ')) + where
}

/**
 *
 * Select * from table with where clause
 *
 */
export function selectFrom (table: string, entity_id: number) {
  return `SELECT * FROM \`${table}\` where entity_id = '${entity_id}'`
}

/**
 *
 *  Select * from table matching with entites table
 *
 */
export function selectFromAll (table: string) {
  return `SELECT * FROM \`${table}\` as A JOIN Entities as B
ON A.entity_id = B.id`
}
