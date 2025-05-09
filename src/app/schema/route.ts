// ROUTE TO RETREIVE THE DB TABLE NAMES

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/helpers/conection'
import {
  executeWithAuth,
  renameKey,
  validateSessionToken
} from '@/helpers/functions'
import { errors } from '@/helpers/errors'
import { userToken } from '@/helpers/types'

export async function POST (req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (error) {
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  return executeWithAuth(data, getCategories)
}

async function getCategories () {
  try {
    const res: any = await prisma.categories.findMany({
      select: { name: true, id: true, id_parent: true, view_name: false }
    })
    res.forEach((obj: { [name: string]: string }) => {
      return renameKey(obj as any, 'Tables_in_base_main', 'table')
    })
    //const res = await prisma.categories.findMany()
    return NextResponse.json({ ok: res }, { status: 200 })
  } catch (err) {
    console.log(err)
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E001 }, { status: 500 })
  }
}
