import { Pool } from 'pg'
import { createPool } from 'mysql2/promise'

interface Database {
  id: string
  name: string
  type: string
  host: string
  port: number
  username: string
  password: string
  database: string
}

interface DatabaseConnection {
  executeQuery: (query: string) => Promise<any>
  disconnect: () => Promise<void>
}

export async function createDatabaseConnection(config: Database): Promise<DatabaseConnection> {
  switch (config.type.toLowerCase()) {
    case 'postgresql': {
      const pool = new Pool({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database,
      })

      return {
        executeQuery: async (query: string) => {
          const result = await pool.query(query)
          return result.rows
        },
        disconnect: async () => {
          await pool.end()
        }
      }
    }

    case 'mysql': {
      const pool = await createPool({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database,
      })

      return {
        executeQuery: async (query: string) => {
          const [rows] = await pool.query(query)
          return rows
        },
        disconnect: async () => {
          await pool.end()
        }
      }
    }

    default:
      throw new Error(`Unsupported database type: ${config.type}`)
  }
} 