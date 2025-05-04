import { NextResponse } from 'next/server'
import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'mysql://base:base@localhost:3306/base_main'
    }
  }
})

type Relacion = {
  id?: Number
  nombre_tabla?: String
  nombre_campo?: String
}

export async function GET () {
  const alm = 'almacen 1'
  const contenedor = 'almacen'

  try {
    //AGREGAR relacion al schema
    const tabla = '2 or 1=1'
    const s = `SELECT * FROM cpu WHERE id = '${tabla}'`
    const relacion = await prisma
      .$queryRawUnsafe<Relacion[]>(s)
      .then(async users => {
        await prisma.$disconnect()
        return users
      })
    // @ts-ignore
    console.log()
    return NextResponse.json({ schema: relacion, s })
  } catch (err) {
    prisma.$disconnect()
    return NextResponse.json({ error: err }, { status: 501 })
  }
}

/*
QUERY BASICA

const users = await prisma.$queryRaw`SELECT * FROM items`.then(
    async users => {
      await prisma.$disconnect()
      return users
    }
  )

CONSEGUIR TODOS LOS ITEMS DE UN TIPO

try {
    const tipos = await prisma.tipos
      .findFirst({
        where: {
          nombre: 'CPU'
        }
      })
      .then(async users => {
        await prisma.$disconnect()
        return users
      })
      .catch(err => {
        throw new Error(err)
      })
    if (tipos?.id != null) {
      const items = await prisma.items
        .findMany({ where: { id_tipo: tipos?.id } })
        .then(async users => {
          await prisma.$disconnect()
          return users
        })
        .catch(err => {
          throw new Error(err)
        })

      const cpu = await prisma
        .$queryRawUnsafe(`SELECT * FROM ${tipos.nombre_tabla}`)
        .then(async cpus => {
          await prisma.$disconnect()
          return cpus
        })
        .catch(err => {
          throw new Error(err)
        })
      return NextResponse.json({ tipo: tipos, items: items, details: cpu })
    } else {
      return NextResponse.json({ error: 'No existe ese tipo de dato' })
    }
  } catch (err) {
    console.error(err)
    prisma.$disconnect()
    return NextResponse.json({ error: err })
  }

*/
