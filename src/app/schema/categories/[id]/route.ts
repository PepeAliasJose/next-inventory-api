// ROUTE TO RETREIVE THE CATEGORY SCHEMA

import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { validateSessionToken } from '@/helpers/functions'
import { userToken } from '@/helpers/types'

export async function POST (
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return getCategory({ params })
    }
  } else {
    return NextResponse.json({ error: errors.E401 }, { status: 403 })
  }
}

async function getCategory ({ params }: { params: { id: string } }) {
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
        `DESCRIBE \`${category?.view_name}\``
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
