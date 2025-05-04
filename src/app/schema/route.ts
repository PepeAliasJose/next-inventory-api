// ROUTE TO RETREIVE THE COMPLETE DB SCHEMA

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/helpers/conection'
import { groupList, renameKey, validateSessionToken } from '@/helpers/functions'
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
      return getCompleteSchema()
    }
  } else {
    return NextResponse.json({ error: errors.E401 }, { status: 403 })
  }
}

async function getCompleteSchema () {
  try {
    const res = await prisma.$queryRaw<
      {}[]
    >`select TABLE_NAME, COLUMN_NAME, IS_NULLABLE, DATA_TYPE from information_schema.columns
WHERE TABLE_SCHEMA = "base_main"`
    return NextResponse.json(
      { schema: groupList(res, 'TABLE_NAME') },
      { status: 200 }
    )
  } catch (err) {
    console.log(err)
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E001 }, { status: 500 })
  }
}
