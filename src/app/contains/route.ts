import { prisma } from '@/helpers/conection'
import { errors } from '@/helpers/errors'
import { executeWithAuth } from '@/helpers/functions'
import { CONTAINER_CAT_ID } from '@/helpers/global'
import { ContainObject } from '@/helpers/types'
import { NextRequest, NextResponse } from 'next/server'

/**
 *
 * Create a relation bewteen 2 objects
 *
 * @param token auth token
 * @param contained entity id to contain
 * @param container entity id of the container
 *
 */
export async function POST (req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (error) {
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  return executeWithAuth(data, containObject)
}

async function containObject (data: ContainObject) {
  try {
    if (data.contained == data.container) {
      return NextResponse.json({ error: errors.E206 }, { status: 400 })
    }
    const ob1 = await prisma.entities.findFirst({
      select: { id: true, name: true, category: true, contained: true },
      where: { id: parseInt(data.contained) }
    })
    const ob2 = await prisma.entities.findFirst({
      select: { id: true, name: true, category: true },
      where: { id: parseInt(data.container) }
    })

    if (ob1 && ob2) {
      //Si los objetos existen y el 2 es un contenedor
      //y el 1 no esta contenido dentro de nada previemante
      const repetido = ob1.contained.length == 0
      if (ob2.category.id_parent == CONTAINER_CAT_ID && repetido) {
        const res = await prisma.contains.create({
          data: {
            id_contained: ob1.id,
            id_container: ob2.id
          }
        })
        return NextResponse.json({ ok: 'ok' }, { status: 200 })
      } else {
        if (!repetido) {
          return NextResponse.json({ error: errors.E203 }, { status: 400 })
        } else {
          return NextResponse.json({ error: errors.E202 }, { status: 400 })
        }
      }
    } else {
      return NextResponse.json({ error: errors.E200 }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

/**
 *
 * DELETE a relation bewteen 2 objects
 *
 * @param token auth token
 * @param contained entity id to remove relation
 *
 */
export async function DELETE (req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (error) {
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  return executeWithAuth(data, deleteContain)
}

async function deleteContain (data: ContainObject) {
  try {
    const res = await prisma.contains.findFirst({
      where: { id_contained: parseInt(data.contained) }
    })
    if (res) {
      await prisma.contains.delete({ where: { id: res.id } })
      return NextResponse.json({ ok: 'ok' }, { status: 200 })
    } else {
      return NextResponse.json({ error: errors.E204 }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'ok' }, { status: 400 })
  }
}

/**
 *
 * UPDATE a relation bewteen 2 objects
 *
 * @param token auth token
 * @param contained entity id to update
 * @param container entity id of the NEW container
 *
 */
export async function PUT (req: NextRequest) {
  let data
  try {
    data = await req.json()
  } catch (error) {
    return NextResponse.json({ error: errors.E002 }, { status: 400 })
  }

  return executeWithAuth(data, updateContain)
}

async function updateContain (data: ContainObject) {
  try {
    if (data.contained == data.container) {
      return NextResponse.json({ error: errors.E206 }, { status: 400 })
    }
    const res = await prisma.contains.findFirst({
      where: { id_contained: parseInt(data.contained) }
    })
    if (res) {
      if (res.id_container !== parseInt(data.container)) {
        await prisma.contains.update({
          data: { id_container: parseInt(data.container) },
          where: { id: res.id }
        })
        return NextResponse.json({ ok: 'ok' }, { status: 200 })
      } else {
        return NextResponse.json({ ok: errors.E205 }, { status: 200 })
      }
    } else {
      return NextResponse.json({ error: errors.E204 }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'ok' }, { status: 400 })
  }
}
