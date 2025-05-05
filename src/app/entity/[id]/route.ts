import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { executeWithAuth, validateSessionToken } from '@/helpers/functions'
import { selectFrom, updateIntoCat } from '@/helpers/queries'
import { AddEntity, userToken } from '@/helpers/types'
import { NextRequest, NextResponse } from 'next/server'

/**
 *
 * Get an entity by id
 *
 */
export async function POST (
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  //Entity id
  const { id } = await params
  let data
  try {
    data = await req.json()
  } catch (error) {
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  return executeWithAuth(data, getEntity)
}

async function getEntity (id: string) {
  try {
    const entity = await prisma.entities.findUnique({
      where: { id: parseInt(id) }
    })
    if (entity) {
      const table = await prisma.categories.findUnique({
        where: { id: entity.category_id }
      })
      const res: unknown[] = await prisma.$queryRawUnsafe(
        selectFrom(table?.view_name?.trim() as string, parseInt(id))
      )
      return NextResponse.json(
        { ok: { entity: entity, data: res[0] } },
        { status: 200 }
      )
    } else {
      return NextResponse.json({ error: errors.E200 }, { status: 400 })
    }
  } catch (error) {
    //console.log(error)
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
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
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  //TODO: Arreglar funciones que necesiten 2 parametros
  if (data.token) {
    const userToken = (await validateSessionToken(data.token)) as userToken
    //Si esta mal devolver el error
    if (userToken.error) {
      return NextResponse.json({ error: userToken.error }, { status: 403 })
    } else if (userToken.admin) {
      //Comprobar si es admin
      return updateEntity(data, id)
    } else {
      return NextResponse.json({ error: errors.E404 }, { status: 403 })
    }
  } else {
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
              data: { name: data.name }
            })
          }
          //console.log('RES: ', res)
          //Actualizar en su tabla
          const updateQuerie = updateIntoCat(
            category?.view_name as string,
            parseInt(id),
            data.data
          )
          //console.log(updateQuerie)
          if (updateQuerie) {
            await tx.$queryRawUnsafe(updateQuerie)
          }
        } else {
          throw new Error(errors.E100)
        }
      })
      return NextResponse.json({ ok: 'ok' }, { status: 200 })
    } catch (err: any) {
      console.log(err)
      return NextResponse.json({ error: err?.message }, { status: 400 })
    }
  } else {
    return NextResponse.json({ error: errors.E100 }, { status: 400 })
  }
}
