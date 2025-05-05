//ROUTE TO CREATE NEW CATEGORY

import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { AddCategory, column, EditCategory, userToken } from '@/helpers/types'
import crypto from 'crypto'
import {
  executeWithAuthAdmin,
  validateColumn,
  validateSessionToken,
  validateString
} from '@/helpers/functions'
import {
  createCategory,
  createColumn,
  createColumns,
  createView
} from '@/helpers/queries'

/**
 *
 * Create category
 *
 * Body structure
 *
 * this endpoint generates an automatic id field for the category and
 * includes an entity_id field for relations
 *
 * category_name: _
 * category: _
 * type: _ ( 1, 2 ) + 1 -> ( 2:Item, 3:Container )
 * columns: [
 *
 *  {
 *      name: _
 *      type: _ ( int, decimal, string, boolean, datetime )
 *      nullable: _
 *      default: _
 *  }
 *
 * ]
 *
 * Create a table with the specified parameters, columns are optional, includes
 * this new table as a category in the categories table with a new id
 *
 */

export async function POST (req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (error) {
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  return executeWithAuthAdmin(data, addCategory)
}

async function addCategory (data: AddCategory) {
  //TODO: cambiar la generacion de nombre de tabla
  let tableName: string
  let nameForCategory: string
  let type: number
  let columns: column[]
  try {
    nameForCategory = data.category_name
    tableName = crypto.randomBytes(16).toString('hex')
    type = parseInt(data.type) + 1
    columns = data.columns
  } catch (error) {
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  //Validations
  if (!validateString(nameForCategory)) {
    //Cannot contain white spaces or special caracters
    return NextResponse.json({ error: errors.E101 }, { status: 400 })
  }
  if (isNaN(type) || type < 2 || type > 3) {
    //Needs to be a valid category
    return NextResponse.json({ error: errors.E102 }, { status: 400 })
  }
  let columnsNamesValidation: string[] = []
  try {
    columns.forEach(column => {
      if (columnsNamesValidation.includes(column.name)) {
        throw new Error(errors.E109)
      }
      columnsNamesValidation.push(column.name)
      validateColumn(column)
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  try {
    const res = await prisma.$transaction([
      prisma.$executeRawUnsafe(createCategory(tableName)),
      prisma.$executeRawUnsafe(createColumns(tableName, columns)),
      //prisma.$executeRawUnsafe(createView(tableName)),
      prisma.categories.create({
        data: { name: nameForCategory, id_parent: type, view_name: tableName }
      })
    ])
    //console.log(createCategory(tableName))

    return NextResponse.json({ ok: res }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: errors.E001 + ' - ' + error?.meta?.message },
      { status: 400 }
    )
  }
}

/**
 *
 * Change category name / type
 *
 * @param new_name category new name
 * @param type category new parent id
 *
 */
export async function PUT (req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  return executeWithAuthAdmin(data, editCategory)
}

async function editCategory (data: EditCategory) {
  let result = ''
  if (data.category_id > 3) {
    if (data.new_name) {
      //Cambiar nombre en 'Categories'
      try {
        const res = await prisma.categories.update({
          where: { id: parseInt(data.category_id as unknown as string) },
          data: { name: data.new_name }
        })
      } catch (error: any) {
        return NextResponse.json(
          { error: errors.E001 + ' - ' + error?.meta?.message },
          { status: 400 }
        )
      }
      result += 'OK: Name changed succesfully '
    }
    if (data.new_type == 1 || data.new_type == 2) {
      //cambiar el tipo
      const tipo = parseInt(data.new_type as unknown as string) + 1
      try {
        const res = await prisma.categories.update({
          where: { id: parseInt(data.category_id as unknown as string) },
          data: { id_parent: tipo }
        })
      } catch (error: any) {
        return NextResponse.json(
          { error: errors.E001 + ' - ' + error?.meta?.message },
          { status: 400 }
        )
      }
      result += 'OK: Type changed succesfully'
    } else if (data.new_type) {
      return NextResponse.json({ error: errors.E102 }, { status: 400 })
    }

    return NextResponse.json({ ok: result }, { status: 200 })
  } else {
    return NextResponse.json({ error: errors.E100 }, { status: 400 })
  }
}

/**
 *
 * TODO: Delete category
 * TODO: Auth
 *
 */
export async function DELETE (req: NextRequest) {
  try {
    return deleteCategory(req)
  } catch (error) {
    return NextResponse.json({ error: errors.E001 }, { status: 500 })
  }
}

async function deleteCategory (req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (error) {
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  if (data.category_id > 3) {
    return NextResponse.json({ ok: 'Correcto' }, { status: 200 })
    //Borrar las entidades de la tabla de 'Entitites'
    //Borrar las relaciones de contenedor que tengan una id de las borradas
    //Borrar el registro de la tabla 'Categories'
    //Borrar la tabla
  } else {
    return NextResponse.json({ error: errors.E100 }, { status: 400 })
  }
}
