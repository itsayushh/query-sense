import { NextResponse } from 'next/server'
import { QueryGenerator } from '@/lib/ai/queryGenerator'
import { getStoredCredentials } from '@/utils/sessionStore'
import { DatabaseManager } from '@/lib/database/manager'
import { DatabaseFactory } from '@/lib/database/factory'

export async function POST(request: Request) {
  let connection: any = null
  let config = null
  const dbManager = DatabaseManager.getInstance()

  try {
    const { prompt } = await request.json()
    
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

    // Generate query
    const queryGenerator = new QueryGenerator(process.env.GEMINI_API_KEY!)
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