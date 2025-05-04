import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { validateSessionToken } from '@/helpers/functions'
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
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  if (data.token) {
    const userToken = (await validateSessionToken(data.token)) as userToken
    //Si esta mal devolver el error
    if (userToken.error) {
      return NextResponse.json({ error: userToken.error }, { status: 403 })
    } else if (userToken.admin) {
      //Comprobar si es admin
      return addEntity(data)
    } else {
      return NextResponse.json({ error: errors.E404 }, { status: 403 })
    }
  } else {
    return NextResponse.json({ error: errors.E401 }, { status: 403 })
  }
}

async function addEntity (data: AddEntity) {
  //Si es una categoria valida
  if (parseInt(data.category_id) > 3) {
    try {
      await prisma.$transaction(async tx => {
        //Insertar el objeto en Entitites
        const res = await tx.entities.create({
          data: { name: data.name, category_id: parseInt(data.category_id) }
        })
        const category = await tx.categories.findUnique({
          where: { id: parseInt(data.category_id) }
        })
        console.log('RES: ', res, category)
        //Comprobar si la categoria existe
        if (category) {
          //Insertar en su tabla
          insertIntoCat(category?.view_name as string, res.id, data.data)
        } else {
          return NextResponse.json({ error: errors.E100 }, { status: 400 })
        }

        throw new Error('')
      })
    } catch (err) {
      // Handle the rollback...
      console.log({ err })
      return NextResponse.json({ error: errors.E002 }, { status: 400 })
    }
  } else {
    return NextResponse.json({ error: errors.E100 }, { status: 400 })
  }
}
