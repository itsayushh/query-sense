import { DatabaseConnectionConfig, ConnectionResult, DatabaseType } from '@/types/Database'
import { DatabaseFactory } from './factory'

export class DatabaseManager {
    static async establishConnection(config: DatabaseConnectionConfig): Promise<ConnectionResult> {
      const connection = DatabaseFactory.getConnection(config.type)
      
      try {
        const conn = await connection.connect(config) as any
        const tables = await connection.getTables(conn)
        return { success: true, connection: conn, tables }
      } catch (error) {
        return {
          success: false,
          connection: null,
          tables: [],
          error: error instanceof Error ? error.message : 'Connection failed'
        }
      }
    }
  
    static async closeConnection(type: DatabaseType, connection: any): Promise<void> {
      const dbConnection = DatabaseFactory.getConnection(type)
      await dbConnection.disconnect(connection)
    }
  }
  