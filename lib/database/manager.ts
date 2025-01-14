// src/lib/database/manager.ts
import { DatabaseConnectionConfig, ConnectionResult, TableSchema, DatabaseType } from '@/types/Database'
import { DatabaseFactory } from './factory'


export class DatabaseManager {
  private static instance: DatabaseManager
  private schemaCache: Map<string, TableSchema[]>
  private lastCacheUpdate: Map<string, number>
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

  private constructor() {
    this.schemaCache = new Map()
    this.lastCacheUpdate = new Map()
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  async establishConnection(config: DatabaseConnectionConfig) {
    const connection = DatabaseFactory.getConnection(config.type)
    
    try {
      const conn = await connection.connect(config)
      return { success: true, connection: conn }
    } catch (error) {
      return {
        success: false,
        connection: null,
        error: error instanceof Error ? error.message : 'Connection failed'
      }
    }
  }

  async getTables(type: DatabaseType, connection: any): Promise<string[]> {
    const dbConnection = DatabaseFactory.getConnection(type)
    try {
      return await dbConnection.getTables(connection)
    } catch (error) {
      throw new Error(`Failed to get tables: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getTableSchema(
    type: DatabaseType, 
    connection: any, 
    tables: string[], 
    useCache: boolean = true
  ): Promise<TableSchema[]> {
    const cacheKey = `${type}-${tables.join('-')}`

    // Check cache if enabled
    if (useCache && this.isCacheValid(cacheKey)) {
      const cachedSchema = this.schemaCache.get(cacheKey)
      if (cachedSchema) {
        return cachedSchema
      }
    }

    try {
      const dbConnection = DatabaseFactory.getConnection(type)
      const schemas = await dbConnection.getTableSchema(connection, tables)

      // Update cache
      this.schemaCache.set(cacheKey, schemas)
      this.lastCacheUpdate.set(cacheKey, Date.now())

      return schemas
    } catch (error) {
      throw new Error(`Failed to get table schema: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getTableDetails(
    config: DatabaseConnectionConfig,
    tableName: string
  ): Promise<TableSchema | null> {
    let connection = null
    
    try {
      const connResult = await this.establishConnection(config)
      if (!connResult.success) {
        throw new Error(connResult.error)
      }
      
      connection = connResult.connection
      const schemas = await this.getTableSchema(config.type, connection, [tableName])
      return schemas[0] || null
    } catch (error) {
      throw new Error(`Failed to get table details: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      if (connection) {
        await this.closeConnection(config.type, connection)
      }
    }
  }

  private isCacheValid(cacheKey: string): boolean {
    const lastUpdate = this.lastCacheUpdate.get(cacheKey)
    if (!lastUpdate) return false
    
    return Date.now() - lastUpdate < this.CACHE_DURATION
  }

  clearCache(type?: DatabaseType, tables?: string[]): void {
    if (!type && !tables) {
      // Clear entire cache
      this.schemaCache.clear()
      this.lastCacheUpdate.clear()
      return
    }

    // Clear specific cache entries
    this.schemaCache.forEach((_, key) => {
      if (key.startsWith(type!) || 
          (tables && tables.some(table => key.includes(table)))) {
        this.schemaCache.delete(key)
        this.lastCacheUpdate.delete(key)
      }
    })
  }

  async closeConnection(type: DatabaseType, connection: any): Promise<void> {
    const dbConnection = DatabaseFactory.getConnection(type)
    await dbConnection.disconnect(connection)
  }
}