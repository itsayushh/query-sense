import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const DatabaseSchema = z.object({
  name: z.string(),
  type: z.string(),
  host: z.string(),
  port: z.number(),
  username: z.string(),
  password: z.string(),
  database: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validated = DatabaseSchema.parse(body)
    
    const database = await prisma.database.create({
      data: validated
    })
    
    return NextResponse.json(database)
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

export async function GET() {
  const databases = await prisma.database.findMany()
  return NextResponse.json(databases)
} 