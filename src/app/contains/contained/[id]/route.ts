import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { executeWithAuth } from '@/helpers/functions'
import { selectFrom } from '@/helpers/queries'
import { NextRequest, NextResponse } from 'next/server'

export async function POST (
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = await params
  let data
  try {
    data = await req.json()
  } catch (error) {
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }
  data.id = id

  return executeWithAuth(data, getEntityContainer)
}

async function getEntityContainer (data: { id: string }) {
  try {
    const item = await prisma.entities.findFirst({
      select: {
        //id: true,
        contains: {
          select: {
            id: true,
            name: true,
            category: { select: { name: true, id: true } }
          }
        } //, name: true, category: true } }
      },
      where: { id: parseInt(data.id) }
    })
    if (item) {
      return NextResponse.json({ ok: item }, { status: 200 })
    } else {
      return NextResponse.json({ error: errors.E204 }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }
}
