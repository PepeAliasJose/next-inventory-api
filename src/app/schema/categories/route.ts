// ROUTE TO RETREIVE THE DB TABLE NAMES

import { NextResponse } from 'next/server'
import { prisma } from '@/helpers/conection'
import { renameKey } from '@/helpers/functions'
import { errors } from '@/helpers/errors'

export async function GET () {
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
