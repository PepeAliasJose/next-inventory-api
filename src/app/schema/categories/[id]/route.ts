// ROUTE TO RETREIVE THE CATEGORY SCHEMA

import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'

export async function GET (
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params
    if (isNaN(parseInt(id))) {
      return NextResponse.json({ error: errors.E100 }, { status: 400 })
    }
    const category = await prisma.categories.findUnique({
      where: { id: parseInt(id) }
    })
    if (category && parseInt(id) > 3) {
      const res = await prisma.$queryRawUnsafe<{}[]>(
        `DESCRIBE \`${category?.name}\``
      )
      return NextResponse.json(
        { category: category, columns: res },
        { status: 200 }
      )
    } else {
      return NextResponse.json({ error: errors.E100 }, { status: 400 })
    }
  } catch (err) {
    console.log(err)
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E001 }, { status: 500 })
  }
}
