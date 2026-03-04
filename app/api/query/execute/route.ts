 import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { DatabaseManager } from '@/lib/database/manager'
import { getStoredCredentials } from '@/utils/sessionStore'
import { DatabaseFactory } from '@/lib/database/factory'
import { QueryGenerator } from '@/lib/ai/queryGenerator'

// Reuse the same query generator instances
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
    const { query } = await request.json()
    
    // Check authentication status
    const { userId } = await auth()
    
    // Get session ID
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

    // Execute query
    const dbConnection = DatabaseFactory.getConnection(config.type)
    const result = await dbConnection.executeQuery(connection, query)

    // Get query generator to provide execution feedback
    const queryGenerator = getQueryGenerator(sessionId)
    
    // Add execution feedback to conversation context
    await queryGenerator.addExecutionFeedback(
      query, 
      result.success, 
      result.success ? undefined : result.error
    )

    if (!result.success) {
      throw new Error(`Query execution failed: ${result.error}`)
    }

    // Return success with query consumption indicator for frontend
    return NextResponse.json({ 
      success: true, 
      query: query, 
      data: result.data,
      shouldConsumeQuery: !userId // Only consume if not authenticated
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to execute query'
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