import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { executeWithAuth, validateSessionToken } from '@/helpers/functions'
import {
  selectFrom,
  selectFromAll,
  selectFromAllJoin,
  updateIntoCat
} from '@/helpers/queries'
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
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }
  data.id = id
  return executeWithAuth(data, getEntities)
}

async function getEntities (data: { id: string; join: string[] }) {
  if (parseInt(data.id) > 3) {
    try {
      const category = await prisma.categories.findUnique({
        where: { id: parseInt(data.id) }
      })
      if (category) {
        const categoryData = selectFromAll(category.view_name as string)
        const res: {} = await prisma.$queryRawUnsafe(categoryData)
        prisma.$disconnect()
        return NextResponse.json({ ok: res }, { status: 200 })
      } else {
        prisma.$disconnect()
        return NextResponse.json({ error: errors.E100 }, { status: 400 })
      }
    } catch (error) {
      //console.log(error)
      prisma.$disconnect()
      return NextResponse.json({ error: errors.E002 }, { status: 400 })
    }
  } else {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E100 }, { status: 400 })
  }
}
