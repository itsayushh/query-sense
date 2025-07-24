import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { DatabaseManager } from '@/lib/database/manager'
import { getStoredCredentials } from '@/utils/sessionStore'
import { DatabaseFactory } from '@/lib/database/factory'

export async function POST(request: Request) {
  let connection: any = null
  let config = null
  const dbManager = DatabaseManager.getInstance()

  try {
    const { query } = await request.json()
    
    // Check authentication status
    const { userId } = await auth()
    
    // For unauthenticated users, the middleware has already checked free queries
    // If we reach here, they either have queries left or are authenticated
    
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
