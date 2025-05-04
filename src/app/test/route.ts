import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET () {
  //Create md5 password for testing
  //crypto.createHash('md5').update( passwd ).digest('hex').toString()

  return NextResponse.json(
    {
      payload: ''
    },
    { status: 200 }
  )
}
