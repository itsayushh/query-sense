// generate-query route.ts
import { NextResponse } from 'next/server'
import { QueryGenerator } from '@/lib/ai/queryGenerator'
import { getStoredCredentials } from '@/utils/sessionStore'
import { DatabaseManager } from '@/lib/database/manager'
import { DatabaseFactory } from '@/lib/database/factory'

// Store query generator instances per session
const queryGenerators = new Map<string, QueryGenerator>()

function getQueryGenerator(sessionId: string): QueryGenerator {
  if (!queryGenerators.has(sessionId)) {
    queryGenerators.set(sessionId, new QueryGenerator(process.env.GEMINI_API_KEY!))
  }
  return queryGenerators.get(sessionId)!
}

export async function POST(request: Request) {
  let connection: any = null
  let config = null
  const dbManager = DatabaseManager.getInstance()

  try {
    const { prompt } = await request.json()
    
    // Get or create session ID (you might want to use Clerk's session ID or create your own)
    const sessionId = request.headers.get('x-session-id') || 'default'
    
    // Retrieve stored database credentials
    config = await getStoredCredentials()
    if (!config) {
      throw new Error('Database connection not found')
    }

    // Establish connection
    const connResult = await dbManager.establishConnection(config)
    if (!connResult.success) {
      throw new Error(connResult.error)
    }
    connection = connResult.connection

    // Get tables and schemas
    const tables = await dbManager.getTables(config.type, connection)
    const dbConnection = DatabaseFactory.getConnection(config.type)
    const schemas = await dbConnection.getTableSchema(connection, tables)

    // Get or create query generator for this session
    const queryGenerator = getQueryGenerator(sessionId)
    
    // Generate query using conversation context
    const sqlQuery = await queryGenerator.generateQuery(config, schemas, prompt)

    return NextResponse.json({ 
      success: true, 
      query: sqlQuery 
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate query'
      },
      { status: 500 }
    )
  } finally {
    // Ensure connection is closed
    if (connection && config) {
      await dbManager.closeConnection(config.type, connection)
    }
  }
}

// Optional: Add endpoint to reset conversation
export async function DELETE(request: Request) {
  try {
    const sessionId = request.headers.get('x-session-id') || 'default'
    const queryGenerator = queryGenerators.get(sessionId)
    
    if (queryGenerator) {
      queryGenerator.resetContext()
      console.log(`Conversation context reset for session: ${sessionId}`)
    }

    return NextResponse.json({ success: true, message: 'Context reset' })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reset context'
      },
      { status: 500 }
    )
  }
}

