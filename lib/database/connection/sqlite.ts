import sqlite3 from 'sqlite3'
import { DatabaseConnectionConfig, TableSchema } from '@/types/Database'
import { DatabaseConnection } from './base'
import { promisify } from 'util'

export class SQLiteConnection extends DatabaseConnection {
  async connect(config: DatabaseConnectionConfig) {
    const connection = config.method === 'url'
      ? new sqlite3.Database(config.connectionString)
      : new sqlite3.Database(config.parameters.database)
    return connection
  }

  async disconnect(connection: sqlite3.Database) {
    await promisify(connection.close.bind(connection))()
}

  async getTables(connection: sqlite3.Database): Promise<string[]> {
    return new Promise((resolve, reject) => {
        connection.all(
          "SELECT name FROM sqlite_master WHERE type='table'",
          (err, tables: Array<{name: string}>) => {
            if (err) reject(err)
            resolve(tables.map(t => t.name))
          }
        )
      })
  }

  async getTableSchema(connection: sqlite3.Database, tables: string[]): Promise<TableSchema[]> {
    const query = promisify(connection.all.bind(connection))
        
        return await Promise.all(tables.map(async (table) => {
          const columns = await query(
            `PRAGMA table_info(${table})`
          ) as Array<{
            name: string,
            type: string,
            notnull: number,
            pk: number
          }>
          
          return {
            tableName: table,
            columns: columns.map(col => ({
              name: col.name,
              type: col.type,
              nullable: !col.notnull,
              isPrimary: Boolean(col.pk)
            }))
          }
        }))
  }
}