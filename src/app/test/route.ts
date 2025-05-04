import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET () {
  //Create md5 password for testing
  //crypto.createHash('md5').update( passwd ).digest('hex').toString()

  //Generate random string
  //16 Bytes = 3.402823669209385e+38 posibilities
  //crypto.randomBytes(16).toString('hex')

  return NextResponse.json(
    {
      payload: ''
    },
    { status: 200 }
  )
}
