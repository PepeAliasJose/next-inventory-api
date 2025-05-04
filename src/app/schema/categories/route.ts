// ROUTE TO RETREIVE THE DB TABLE NAMES

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/helpers/conection'
import { renameKey, validateSessionToken } from '@/helpers/functions'
import { errors } from '@/helpers/errors'
import { userToken } from '@/helpers/types'

export async function POST (req: NextRequest) {
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
      return getCategories()
    }
  } else {
    return NextResponse.json({ error: errors.E401 }, { status: 403 })
  }
}

async function getCategories () {
  try {
    const res = await prisma.$queryRaw<{}[]>`SELECT * FROM Categories`
    res.forEach((obj: { [k: string]: string }) => {
      return renameKey(obj, 'Tables_in_base_main', 'table')
    })
    //const res = await prisma.categories.findMany()
    return NextResponse.json({ schema: res }, { status: 200 })
  } catch (err) {
    console.log(err)
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E001 }, { status: 500 })
  }
}
