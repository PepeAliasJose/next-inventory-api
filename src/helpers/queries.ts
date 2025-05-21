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
  console.log('COL: ', column)
  let query = `ALTER TABLE \`${tableName}\` 
    ADD COLUMN \`${column.name.toLowerCase()}\` ${
    typeSQL[typeValues.indexOf(column.type)]
  } ${column.nullable.toString() == 'true' ? '' : notNull} 
    `
  //console.log(query)
  return query
}

/*
DEFAULT \'${typeFunctions[typeValues.indexOf(column.type)](
      column.default as string
    )}\'
*/

/**
 *
 * @param tableName table's name to drop col
 * @param columns column to drop
 * @returns que query needed for the operation
 */
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
  data: { [k: string]: any } = {}
) {
  let insert = `INSERT INTO \`${tableName}\` (?) `
  let values = 'VALUES (?)'

  const dataKeys = Object.keys(data)
    .filter((k: any) => {
      if (data[k].value.toString().length > 0) {
        return true
      }
      return false
    })
    .map(x => {
      return '`' + x + '`'
    })
  dataKeys.push('`entity_id`')

  const dataValues = Object.keys(data)
    .filter((k: any) => {
      if (data[k].value.toString().length > 0) {
        return true
      }
      return false
    })
    .map((x: any) => {
      return (
        "'" +
        typeFunctions[typeValues.indexOf(data[x].type)](data[x].value) +
        "'"
      )
    })
  dataValues.push(
    "'" + (objectId.toString().length > 0 ? objectId.toString() : 'NULL') + "'"
  )
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
  return `SELECT B.name, B.category_id, C.id as location_id, C.name as location, A.* FROM \`${table}\` as A LEFT JOIN Entities as B
ON A.entity_id = B.id LEFT JOIN Entities as C ON B.location = C.id`
}

/**
 *
 *  Select * from table matching with entites table
 *  Select all entities from a table, join with entity table
 */
export function selectFromAllJoin (table: string, column: { column: string }[]) {
  const letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

  const join = `SELECT A.*, B.* AS rel_cat FROM \`${table}\` as A 
  JOIN Entities as B ON A.entity_id = B.id
  JOIN Entities as C ON C.id = A.\`${column}\``

  return join
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

/**
 *
 * search for tables which contain a column name
 * Only returns a single result
 *
 * @param column name
 *
 * @return the query needed for the search
 *
 */
export function searchTableColumn (column: string) {
  return `SELECT TABLE_NAME, COLUMN_NAME, Categories.name AS CAT_NAME, Categories.id AS CAT_ID
          FROM information_schema.columns
          JOIN Categories ON view_name = TABLE_NAME
          WHERE COLUMN_NAME LIKE "%${column}%";`
}

/**
 *
 * Remove reference before deleting a category
 *
 * @param column name
 *
 * @return the query needed for the search
 *
 */
export function deleteReferenceCategory (
  table: string,
  column: string,
  search: string
) {
  return `UPDATE \`${table}\` SET \`${column}\` = NULL WHERE \`${column}\` LIKE "%${search}%";`
}

/**
 *
 * Remove reference before deleting a entity
 *
 * @param column name
 *
 * @return the query needed for the search
 *
 */
export function deleteReferenceEntity (
  table: string,
  column: string,
  search: string
) {
  return `UPDATE \`${table}\` SET \`${column}\` = NULL WHERE \`${column}\` LIKE "${search}%";`
}

/**
 *
 * DROP TABLE
 *
 * @param column name
 *
 * @return the query needed for the search
 *
 */
export function dropTable (table: string) {
  return `DROP TABLE \`${table}\`;`
}

/**
 *
 * search for tables which contain a column name
 * Only returns a single result
 *
 * @param column name
 *
 * @return the query needed for the search
 *
 */
export function completeSchema () {
  return `SELECT TABLE_NAME, COLUMN_NAME, Categories.name AS CAT_NAME, Categories.id AS CAT_ID
          FROM information_schema.columns
          JOIN Categories ON view_name = TABLE_NAME`
}

/**
 *
 * search for value in a specific column and table
 * Only returns a single result
 *
 * @param table table's name
 * @param column columns's name
 * @param value search param
 *
 * @return the query needed for the search
 *
 */
export function searchItemWithTableColumn (
  table: string,
  column: string,
  value: string
) {
  return `SELECT A.*, B.name AS name, B.category_id as cat,
  C.name AS rel_name, C.category_id as rel_cat FROM  \`${table}\` AS A 
  JOIN Entities AS B ON B.id = A.entity_id 
  JOIN ENtities AS C ON C.id = A.\`${column}\`
  WHERE A.\`${column}\` LIKE \'${value}%\' `
}
