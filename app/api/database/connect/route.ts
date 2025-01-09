import { NextResponse } from 'next/server'
import { DatabaseManager } from '@/lib/database/manager'
import { storeCredentials } from '@/utils/sessionStore'
import { DatabaseConnectionConfig } from '@/types/Database'

export async function POST(request: Request) {
  try {
    const config: DatabaseConnectionConfig = await request.json()
    const result = await DatabaseManager.establishConnection(config)
    
    if (!result.success) {
      throw new Error(result.error)
    }

    await storeCredentials(config)
    await DatabaseManager.closeConnection(config.type, result.connection)

    return NextResponse.json({
      success: true,
      message: 'Connection successful',
      tables: result.tables
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to connect to database'
      },
      { status: 500 }
    )
  }
}
