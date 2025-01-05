import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateSQLFromPrompt } from '@/lib/gemini'
import { z } from 'zod'

const QuerySchema = z.object({
  prompt: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { prompt } = QuerySchema.parse(body)
    
    // Generate SQL using Gemini
    const sqlQuery = await generateSQLFromPrompt(prompt)
    
    // Save the query
    const query = await prisma.query.create({
      data: {
        prompt,
        result: sqlQuery,
      }
    })
    
    return NextResponse.json(query)
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}

export async function GET() {
  const queries = await prisma.query.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })
  return NextResponse.json(queries)
} 