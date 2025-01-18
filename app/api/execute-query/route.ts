import { NextResponse } from 'next/server'
import { DatabaseManager } from '@/lib/database/manager'
import { QueryGenerator } from '@/lib/ai/queryGenerator'
import { getStoredCredentials } from '@/utils/sessionStore'
import { DatabaseFactory } from '@/lib/database/factory'

export async function POST(request: Request) {
  let connection: any = null
  let config = null
  const dbManager = DatabaseManager.getInstance()
  
  try {
    const { prompt } = await request.json()
    config = await getStoredCredentials()
    if (!config) {
      throw new Error('Database connection not found')
    }
    
    
    const connResult = await dbManager.establishConnection(config)
    if (!connResult.success) {
      throw new Error(connResult.error)
    }
    const tables = await dbManager.getTables(config.type, connResult.connection)
    

    
    connection = connResult.connection
    const dbConnection = DatabaseFactory.getConnection(config.type)
    const schemas = await dbConnection.getTableSchema(connection, tables)
    const queryGenerator = new QueryGenerator(process.env.GEMINI_API_KEY!)
    let sqlQuery = await queryGenerator.generateQuery(config, schemas, prompt)
    let result = await dbConnection.executeQuery(connection, sqlQuery)
    // If first attempt fails, try with refined context
    if (!result.success) {
      // console.log('First attempt failed:', result.error)
      
      // Generate refined query using the error message
      const refinedQuery = await queryGenerator.generateQuery(
        config,
        schemas,
        prompt,
        { 
          useRefinedContext: true, 
          previousError: result.error 
        }
      )
      
      // Execute refined query
      result = await dbConnection.executeQuery(connection, refinedQuery)
      
      if (!result.success) {
        throw new Error(`Query execution failed after refinement: ${result.error}`)
      }
      sqlQuery = refinedQuery
    }

    return NextResponse.json({ success: true, query: sqlQuery , data: result.data })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate query'
      },
      { status: 500 }
    )
  }
   finally {
    if (connection && config) {
      await dbManager.closeConnection(config.type, connection)
    }
  }
}
