import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { validateSessionToken } from '@/helpers/functions'
import {
  deleteFrom,
  deleteReferenceEntity,
  searchTableColumn,
  selectFrom,
  updateIntoCat
} from '@/helpers/queries'
import { AddEntity, userToken } from '@/helpers/types'
import { NextRequest, NextResponse } from 'next/server'

/**
 *
 * Get an entity by id
 *
 */
export async function POST (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  //Entity id
  const { id } = await params
  let data
  try {
    data = await req.json()
  } catch (error) {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  //TODO: Arreglar funciones que necesiten 2 parametros
  if (data.token) {
    const userToken = (await validateSessionToken(data.token)) as userToken
    //Si esta mal devolver el error
    if (userToken.error) {
      prisma.$disconnect()
      return NextResponse.json({ error: userToken.error }, { status: 403 })
    } else {
      //No necesita admin aqui
      return getEntity(id)
    }
  } else {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E401 }, { status: 403 })
  }
}

async function getEntity (id: string) {
  try {
    const entity = await prisma.entities.findUnique({
      select: {
        id: true,
        category_id: true,
        located: true,
        location: true,
        name: true,
        contains: true
      },
      where: { id: parseInt(id) }
    })
    if (entity) {
      const table = await prisma.categories.findUnique({
        where: { id: entity.category_id }
      })
      const res: unknown[] = await prisma.$queryRawUnsafe(
        selectFrom(table?.view_name?.trim() as string, parseInt(id))
      )
      prisma.$disconnect()
      return NextResponse.json(
        { ok: { entity: { ...entity, category: table }, data: res[0] } },
        { status: 200 }
      )
    } else {
      prisma.$disconnect()
      return NextResponse.json({ error: errors.E200 }, { status: 400 })
    }
  } catch (error: any) {
    //console.log(error)
    prisma.$disconnect()
    return NextResponse.json(
      { error: errors.E002 + ' - ' + error.message },
      { status: 400 }
    )
  }
}

/**
 *
 * Update an entity
 *
 */
export async function PUT (
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  //Entity id
  const { id } = await params
  let data
  try {
    data = await req.json()
  } catch (error) {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  //TODO: Arreglar funciones que necesiten 2 parametros
  if (data.token) {
    const userToken = (await validateSessionToken(data.token)) as userToken
    //Si esta mal devolver el error
    if (userToken.error) {
      prisma.$disconnect()
      return NextResponse.json({ error: userToken.error }, { status: 403 })
    } else {
      //No neceita admin aqui
      return updateEntity(data, id)
    }
  } else {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E401 }, { status: 403 })
  }
}

async function updateEntity (data: AddEntity, id: string) {
  //Si es una categoria valida
  if (parseInt(data.category_id) > 3) {
    try {
      const res = await prisma.$transaction(async tx => {
        const category = await tx.categories.findUnique({
          where: { id: parseInt(data.category_id) }
        })
        //console.log('CAT: ', category)

        //Comprobar si la categoria existe
        if (category) {
          //Actualziar el objeto en Entitites
          if (data.name) {
            const res = await tx.entities.update({
              where: { id: parseInt(id) },
              data: {
                name: data.name,
                location: data.location ? data.location : null
              }
            })
          }
          //console.log('RES: ', res)
          //Actualizar en su tabla
          if (Object.keys(data.data).length > 0) {
            const updateQuerie = updateIntoCat(
              category?.view_name as string,
              parseInt(id),
              data.data
            )
            console.log(updateQuerie)
            if (updateQuerie) {
              await tx.$queryRawUnsafe(updateQuerie)
            }
          }
        } else {
          throw new Error(errors.E100)
        }
      })
      prisma.$disconnect()
      return NextResponse.json({ ok: 'ok' }, { status: 200 })
    } catch (err: any) {
      console.log(err)
      prisma.$disconnect()
      return NextResponse.json({ error: err?.message }, { status: 400 })
    }
  } else {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E100 }, { status: 400 })
  }
}

/**
 *
 * DELETE an entity by id
 * //TODO: find references and delete
 *
 */
export async function DELETE (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  //Entity id
  const { id } = await params
  let data
  try {
    data = await req.json()
  } catch (error) {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  //TODO: Arreglar funciones que necesiten 2 parametros
  if (data.token) {
    const userToken = (await validateSessionToken(data.token)) as userToken
    //Si esta mal devolver el error
    if (userToken.error) {
      prisma.$disconnect()
      return NextResponse.json({ error: userToken.error }, { status: 403 })
    } else {
      if (userToken.admin) {
        return deleteEntity(id)
      }
      return NextResponse.json({ error: errors.E404 }, { status: 402 })
    }
  } else {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E401 }, { status: 403 })
  }
}

async function deleteEntity (id: string) {
  try {
    const item = await prisma.entities.findUnique({
      select: { id: true, category: true },
      where: { id: parseInt(id) }
    })
    console.log(item)
    const tables: {
      TABLE_NAME: string
      COLUMN_NAME: string
      CAT_NAME: string
      CAT_ID: string
    }[] = await prisma.$queryRawUnsafe(searchTableColumn('eid&'))
    console.log('TABLES: ', tables)
    const queries = tables.map((t, i) => {
      return deleteReferenceEntity(t.TABLE_NAME, t.COLUMN_NAME, id + '::')
    })
    console.log('TABLAS: ', queries)
    if (item) {
      const res = await prisma.$transaction([
        prisma.entities.updateMany({
          //Remove the entity id from all items
          where: { location: item.id },
          data: { location: null }
        }),
        ...queries.map(q => {
          return prisma.$queryRawUnsafe(q)
        }),
        prisma.entities.delete({ where: { id: item.id } }),
        prisma.$queryRawUnsafe(
          deleteFrom(item.category.view_name as string, item.id)
        )
      ])
      prisma.$disconnect()
      return NextResponse.json({ ok: 'ok' }, { status: 200 })
    } else {
      prisma.$disconnect()
      return NextResponse.json({ error: errors.E200 }, { status: 400 })
    }
  } catch (error: any) {
    console.log(error.message)
    prisma.$disconnect()
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
