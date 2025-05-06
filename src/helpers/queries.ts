import { column } from './types'
import { none, parseBoolean, parseDate } from './functions'

const typeValues = ['int', 'decimal', 'string', 'boolean', 'datetime']
//TODO: hacer funciones de conversion restantes
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

/**
 *
 * Create a query to change column name
 *
 * @param tablename table to change column
 * @param old old column name
 * @param newN new column name
 *
 * @return Query string
 */
export function changeColumn (tablename: string, old: string, newN: string) {
  return ''
}

/**
 *
 * @param tableName table name to delete column
 * @param column column name to delete
 *
 * @return DROP query
 *
 */
export function deleteColumn (tableName: string, column: string) {
  return `ALTER TABLE \`${tableName}\` DROP COLUMN \`${column.toLowerCase()}\``
}

export function createView (categoryName: string) {
  return `CREATE view \`${categoryName}_view\` AS  ( SELECT * FROM \`${categoryName}\` )`
}

/**
 *
 * Creates a query to insert values into a category
 *
 * @param tableName table name for inserting data
 * @param objectId entity id
 * @param [data={}] data to insert in the following format:
 *
 * "data":{
 *  "column_name":{"value":"","type":""}, ...
 *  }
 *
 * @return needed query
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

  const dataValues = Object.values(data).map((x: any) => {
    return "'" + typeFunctions[typeValues.indexOf(x.type)](x.value) + "'"
  })
  dataValues.push("'" + objectId.toString() + "'")
  return (
    insert.replace('?', dataKeys.join(', ')) +
    values.replace('?', dataValues.join(', '))
  )
}

/**
 *
 * Creates a query to update values into a category
 *
 * @param tableName table name for updating data
 * @param objectId entity id
 * @param [data={}] data to update in the following format:
 *
 * "data":{
 *  "column_name":{"value":"","type":""}, ...
 *  }
 *
 * @return needed query
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
  const dataValues = Object.values(data).map((x: any) => {
    return "'" + typeFunctions[typeValues.indexOf(x.type)](x.value) + "'"
  })

  let values = []
  for (let x = 0; x < dataKeys.length; x++) {
    values.push(dataKeys[x] + ' = ' + dataValues[x])
  }

  return data.null ? null : update.replace('?', values.join(', ')) + where
}

/**
 *
 * SELECT * FROM TABLE_NAME WHERE entity_id = ?
 * Only returns a single result
 *
 * @param table table's name
 * @param entity_id entity id
 *
 * @return the query needed for the search of a single item
 *
 */
export function selectFrom (table: string, entity_id: number) {
  return `SELECT * FROM \`${table}\` where entity_id = '${entity_id}'`
}

/**
 *
 * SELECT * FROM TABLE_NAME WHERE entity_id IN (?)
 * Return a list of entities
 *
 * @param table table's name
 * @param entity_id_list entity id
 *
 * @return the query needed for the search of a single item
 *
 */
export function selectFromMany (table: string, entity_id: number) {
  const query = `SELECT * FROM \`${table}\` where entity_id IN (?)`
  return ''
}

/**
 *
 *  Select * from table matching with entites table
 *  Select all entities from a table, join with entity table
 */
export function selectFromAll (table: string) {
  return `SELECT * FROM \`${table}\` as A JOIN Entities as B
ON A.entity_id = B.id`
}

/**
 *
 * DELETE FROM TABLE_NAME WHERE entity_id = ?
 * Only returns a single result
 *
 * @param table table's name
 * @param entity_id entity id
 *
 * @return the query needed for the search of a single item
 *
 */
export function deleteFrom (table: string, entity_id: number) {
  return `DELETE FROM \`${table}\` where entity_id = '${entity_id}'`
}
