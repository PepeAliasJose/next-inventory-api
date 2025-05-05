import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { validateSessionToken } from '@/helpers/functions'
import { selectFrom, selectFromAll, updateIntoCat } from '@/helpers/queries'
import { AddEntity, userToken } from '@/helpers/types'
import { NextRequest, NextResponse } from 'next/server'

/**
 *
 * Get an entity list by category id
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

  if (data.token) {
    const userToken = (await validateSessionToken(data.token)) as userToken
    //Si esta mal devolver el error
    if (userToken.error) {
      return NextResponse.json({ error: userToken.error }, { status: 403 })
    } else {
      return getEntities(id)
    }
  } else {
    return NextResponse.json({ error: errors.E401 }, { status: 403 })
  }
}

async function getEntities (id: string) {
  if (parseInt(id) > 3) {
    try {
      const category = await prisma.categories.findUnique({
        where: { id: parseInt(id) }
      })
      if (category) {
        const categoryData = selectFromAll(category.view_name as string)
        const res = await prisma.$queryRawUnsafe(categoryData)
        return NextResponse.json({ ok: res }, { status: 200 })
      } else {
        return NextResponse.json({ error: errors.E100 }, { status: 400 })
      }
    } catch (error) {
      //console.log(error)
      return NextResponse.json({ error: errors.E002 }, { status: 400 })
    }
  } else {
    return NextResponse.json({ error: errors.E100 }, { status: 400 })
  }
}
