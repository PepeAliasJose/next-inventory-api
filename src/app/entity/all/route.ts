import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { executeWithAuth } from '@/helpers/functions'
import { NextRequest, NextResponse } from 'next/server'

export async function POST (req: NextRequest) {
  //Entity id
  let data
  try {
    data = await req.json()
  } catch (error) {
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }
  return executeWithAuth(data, getAllItems)
}

async function getAllItems () {
  try {
    const items = await prisma.entities.findMany({
      select: { id: true, name: true, category_id: true, category: true },
      orderBy: {
        category_id: 'asc'
      }
    })

    return NextResponse.json({ ok: items }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }
}
