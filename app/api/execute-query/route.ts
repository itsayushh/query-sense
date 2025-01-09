import { NextResponse } from 'next/server'
import { DatabaseManager } from '@/lib/database/manager'
import { QueryGenerator } from '@/lib/ai/queryGenerator'
import { getStoredCredentials } from '@/utils/sessionStore'
import { DatabaseFactory } from '@/lib/database/factory'

export async function POST(request: Request) {
  let connection: any = null
  let config = null
  
  try {
    const { prompt, tables } = await request.json()
    config = await getStoredCredentials()
    
    if (!config) {
      throw new Error('Database connection not found')
    }

    const connResult = await DatabaseManager.establishConnection(config)
    if (!connResult.success) {
      throw new Error(connResult.error)
    }
    
    connection = connResult.connection
    const dbConnection = DatabaseFactory.getConnection(config.type)
    const schemas = await dbConnection.getTableSchema(connection, tables)
    
    const queryGenerator = new QueryGenerator(process.env.GEMINI_API_KEY!)
    const sqlQuery = await queryGenerator.generateQuery(config, schemas, prompt)

    return NextResponse.json({ success: true, query: sqlQuery })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate query'
      },
      { status: 500 }
    )
  } finally {
    if (connection && config) {
      await DatabaseManager.closeConnection(config.type, connection)
    }
  }
}
