import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { executeWithAuthAdmin, validateSessionToken } from '@/helpers/functions'
import { userToken } from '@/helpers/types'
import { NextRequest, NextResponse } from 'next/server'

/**
 *
 */
export async function POST (req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (error) {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  if (data.create) {
    return executeWithAuthAdmin(data, createUser)
  } else {
    return executeWithAuthAdmin(data, getUsers)
  }
}

function checkLength (i: string) {
  return i.length > 0
}

async function createUser (data: any) {
  if (!checkLength(data.name)) {
    return NextResponse.json({ error: errors.E300 }, { status: 400 })
  }
  if (!checkLength(data.passwd)) {
    return NextResponse.json({ error: errors.E301 }, { status: 400 })
  }
  if (!checkLength(data.email)) {
    return NextResponse.json({ error: errors.E302 }, { status: 400 })
  }

  try {
    const res = await prisma.users.create({
      data: {
        name: data.name,
        passwd: data.passwd,
        email: data.email,
        admin: data?.admin
      }
    })
    prisma.$disconnect()
    return NextResponse.json({ ok: 'ok' }, { status: 200 })
  } catch (error) {
    console.log('CREATE USER: ', error)
    return NextResponse.json({ error: errors.E001 }, { status: 400 })
  }
}
async function getUsers (data: any) {
  const res = await prisma.users.findMany({
    where: { id: { gt: 1 } },
    select: { name: true, email: true, admin: true, id: true }
  })
  prisma.$disconnect()
  return NextResponse.json({ ok: res }, { status: 200 })
}

/**
 *
 */
export async function DELETE (req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (error) {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  return executeWithAuthAdmin(data, deleteUser)
}

async function deleteUser (data: { id: number; token: string }) {
  try {
    const userToken = (await validateSessionToken(data.token)) as userToken
    if (data.id == parseInt(userToken.userId)) {
      return NextResponse.json({ error: errors.E304 }, { status: 400 })
    }
    if (data.id) {
      const res = await prisma.users.delete({ where: { id: data.id } })
      return NextResponse.json({ ok: res }, { status: 200 })
    } else {
      return NextResponse.json({ error: errors.E303 }, { status: 400 })
    }
  } catch (error) {
    console.log('DELETE USER: ', error)
    return NextResponse.json({ error: errors.E001 }, { status: 400 })
  }
}

/**
 *
 */
export async function PUT (req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (error) {
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  return executeWithAuthAdmin(data, updateUser)
}

async function updateUser (data: {
  id: number
  name: string
  email: string
  passwd: string
  admin: boolean
}) {
  try {
    if (data.id) {
      const res = await prisma.users.update({
        where: { id: data.id },
        data: {
          name: data.name,
          email: data.email,
          passwd: data.passwd,
          admin: data.admin
        }
      })
      return NextResponse.json({ ok: res }, { status: 200 })
    } else {
      return NextResponse.json({ error: errors.E303 }, { status: 400 })
    }
  } catch (error) {
    console.log('DELETE USER: ', error)
    return NextResponse.json({ error: errors.E001 }, { status: 400 })
  }
}
