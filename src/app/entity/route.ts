import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import {
  executeWithAuth,
  executeWithAuthAdmin,
  validateSessionToken
} from '@/helpers/functions'
import { insertIntoCat } from '@/helpers/queries'
import { AddEntity, userToken } from '@/helpers/types'
import { NextRequest, NextResponse } from 'next/server'

/**
 *
 */
export async function POST (req: NextRequest) {
  let data: AddEntity
  try {
    data = await req.json()
  } catch (error) {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }
  console.log('INSERT: ', data)
  return executeWithAuth(data, addEntity)
}

async function addEntity (data: AddEntity) {
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
          //Insertar el objeto en Entitites
          const res = await tx.entities.create({
            data: {
              name: data.name,
              category_id: parseInt(data.category_id),
              location: data?.location ? data.location : null
            }
          })
          //console.log('RES: ', res)
          //Insertar en su tabla
          const insertQuerie = insertIntoCat(
            category?.view_name as string,
            res.id,
            data.data
          )
          console.log('AGREGAR ENTIDAD: ', insertQuerie)
          await tx.$queryRawUnsafe(insertQuerie)
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
