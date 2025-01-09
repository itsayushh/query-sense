import mysql from 'mysql2/promise'
import { DatabaseConnectionConfig, TableSchema } from '@/types/Database'
import { DatabaseConnection } from './base'

export class MySQLConnection extends DatabaseConnection {
  async connect(config: DatabaseConnectionConfig) {
    const connection = config.method === 'url'
      ? await mysql.createConnection(config.connectionString)
      : await mysql.createConnection({
          host: config.parameters!.host,
          port: config.parameters!.port,
          user: config.parameters!.username,
          password: config.parameters!.password,
          database: config.parameters!.database
        })
    
    await connection.connect()
    return connection
  }

  async disconnect(connection: mysql.Connection) {
    await connection.end()
  }

  async getTables(connection: mysql.Connection): Promise<string[]> {
    const [rows] = await connection.query('SHOW TABLES')
    return (rows as any[]).map(row => Object.values(row)[0] as string)
  }

  async getTableSchema(connection: mysql.Connection, tables: string[]): Promise<TableSchema[]> {
    const conn = connection as mysql.Connection
        const database = conn.config.database
        return await Promise.all(tables.map(async (table) => {
          const [columns] = await conn.query(`
            SELECT 
              COLUMN_NAME as name,
              DATA_TYPE as type,
              IS_NULLABLE as nullable,
              COLUMN_KEY as \`key\`
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = ? AND TABLE_SCHEMA = ?
          `, [table, database])
          
          return {
            tableName: table,
            columns: (columns as any[]).map(col => ({
              name: col.name,
              type: col.type,
              nullable: col.nullable === 'YES',
              isPrimary: col.key === 'PRI'
            }))
          }
        }))
  }
}