import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { executeWithAuth } from '@/helpers/functions'
import { searchItemWithTableColumn, searchTableColumn } from '@/helpers/queries'
import { ReferenceObjects } from '@/helpers/types'
import { NextRequest, NextResponse } from 'next/server'

export async function POST (req: NextRequest) {
  let data: ReferenceObjects
  try {
    data = await req.json()
  } catch (error) {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  return executeWithAuth(data, getReferenceObjectsFiltered)
}

async function getReferenceObjectsFiltered (data: ReferenceObjects) {
  let result: {}[] = []
  try {
    const tables: {
      TABLE_NAME: string
      COLUMN_NAME: string
      CAT_NAME: string
      CAT_ID: string
    }[] = await prisma.$queryRawUnsafe(
      searchTableColumn(data.filter?.column as string)
    )
    if (tables.length >= 1) {
      //Buscar el dato
      console.log(tables)
      for (let x = tables.length - 1; x >= 0; x--) {
        result.push({
          name: tables[x].CAT_NAME,
          id: tables[x].CAT_ID,
          column_name: tables[x].COLUMN_NAME,
          result: await prisma.$queryRawUnsafe(
            searchItemWithTableColumn(
              tables[x].TABLE_NAME,
              tables[x].COLUMN_NAME,
              data.filter?.value as string
            )
          )
        })
      }
    }
    prisma.$disconnect()
    return NextResponse.json({ ok: result }, { status: 200 })
  } catch (error: any) {
    console.log(error.message)
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }
}
