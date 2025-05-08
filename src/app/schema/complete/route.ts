import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { validateSessionToken } from '@/helpers/functions'
import { userToken } from '@/helpers/types'

//TODO: fix this for the auth function
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
      return getAllCategory()
    }
  } else {
    return NextResponse.json({ error: errors.E401 }, { status: 403 })
  }
}

async function getAllCategory () {
  try {
    const category = await prisma.categories.findMany({
      where: { id: { gt: 3 } }
    })
    const posts = await Promise.all(
      category.map(async cate => {
        const res2 = await prisma.$queryRawUnsafe<{}[]>(
          `DESCRIBE \`${cate?.view_name}\``
        )
        const cat: Partial<{
          id: number
          name: string
          id_parent: number | null
          view_name?: string | null
        } | null> = cate
        delete cat.view_name

        return { category: cat, column: res2 }
      })
    )

    return NextResponse.json({ category: posts }, { status: 200 })
  } catch (err) {
    console.log(err)
    prisma.$disconnect()
    return NextResponse.json({ error: errors.E001 }, { status: 500 })
  }
}
