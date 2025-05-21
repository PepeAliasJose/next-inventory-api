import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { executeWithAuthAdmin } from '@/helpers/functions'
import { createColumn, changeColumn, deleteColumn } from '@/helpers/queries'
import { AddColum, DeleteColum } from '@/helpers/types'
import { NextRequest, NextResponse } from 'next/server'

/**
 *
 * Add column to existing table
 *
 */
export async function POST (req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (error) {
    console.log(error)
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  return await executeWithAuthAdmin(data, addColumn)
}

async function addColumn (data: AddColum) {
  if (parseInt(data.category_id) > 3) {
    try {
      const cat = await prisma.categories.findFirst({
        where: { id: parseInt(data.category_id) }
      })
      if (cat) {
        console.log(createColumn(cat.view_name as string, data.column))
        const res = await prisma.$queryRawUnsafe(
          createColumn(cat.view_name as string, data.column)
        )
        prisma.$disconnect()
        return NextResponse.json({ ok: res }, { status: 200 })
      } else {
        prisma.$disconnect()
        return NextResponse.json({ error: errors.E100 }, { status: 400 })
      }
    } catch (error) {
      console.log(error)
      prisma.$disconnect()
      return NextResponse.json({ error: errors.E002 }, { status: 400 })
    }
  } else {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E100 }, { status: 400 })
  }
}

/**
 *
 * Change column name
 *
 */
export async function DELETE (req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (error) {
    console.log(error)
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  return await executeWithAuthAdmin(data, deleteColumnByName)
}

async function deleteColumnByName (data: DeleteColum) {
  if (parseInt(data.category_id) > 3) {
    try {
      const cat = await prisma.categories.findFirst({
        where: { id: parseInt(data.category_id) }
      })
      if (cat) {
        const res = await prisma.$queryRawUnsafe(
          deleteColumn(cat.view_name as string, data.column)
        )
        prisma.$disconnect()
        return NextResponse.json({ ok: res }, { status: 200 })
      } else {
        prisma.$disconnect()
        return NextResponse.json({ error: errors.E100 }, { status: 400 })
      }
    } catch (error) {
      console.log(error)
      prisma.$disconnect()
      return NextResponse.json({ error: errors.E002 }, { status: 400 })
    }
  } else {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E100 }, { status: 400 })
  }
}
