import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

async function authUser (username: string, passwd: string) {
  return await prisma.users.findFirst({
    select: { id: true, name: true, email: true, admin: true },
    where: { name: username, passwd: passwd }
  })
}

/**
 *
 * @param req params for loging -> { username:"", passwd:"" }
 */
export async function POST (req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (error) {
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  const user = await authUser(data.username, data.passwd)
  if (user) {
    const key = process.env.JWT_SECRET
    const token = jwt.sign(
      { userId: user.id, admin: user.admin },
      key as string,
      {
        expiresIn: '7d'
      }
    )
    return NextResponse.json({ ok: token }, { status: 200 })
  } else {
    return NextResponse.json({ ok: errors.E400 }, { status: 403 })
  }

  return NextResponse.json({ ok: 'ok' }, { status: 200 })
}
