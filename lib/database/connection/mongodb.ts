import { DatabaseConnectionConfig, TableSchema } from '@/types/Database'
import { DatabaseConnection } from './base'
import { promisify } from 'util'
import { MongoClient } from 'mongodb'

export class MongoDBConnection extends DatabaseConnection {
  async connect(config: DatabaseConnectionConfig) {
    const connection = config.method === 'url'
      ? new MongoClient(config.connectionString)
      : new MongoClient(`mongodb://${config.parameters.username}:${encodeURIComponent(config.parameters.password)}@${config.parameters.host}:${config.parameters.port}/${config.parameters.database}`)
    return connection
  }

  async disconnect(connection: MongoClient) {
    await connection.close()
  }

  async getDatabase(connection: MongoClient): Promise<string[]> {
    const databases = await connection.db().admin().listDatabases()
    return databases.databases.map((db: any) => db.name)
  }


  async getTables(connection: MongoClient): Promise<string[]> {
    const collections = await connection.db().listCollections().toArray()
    return collections.map(col => col.name)
  }

  async getTableSchema(connection: MongoClient, tables: string[]): Promise<TableSchema[]> {
    const database = connection.db().databaseName
    if (!database) throw new Error('Database name not found in connection config')
    const db = connection.db(database)
    return await Promise.all(tables.map(async (collection) => {
      const sample = await db.collection(collection)
        .aggregate([{ $sample: { size: 1 } }])
        .toArray()
      
      const columns = sample.length > 0 
        ? Object.entries(sample[0]).map(([key, value]) => ({
            name: key,
            type: typeof value,
            nullable: true,
            isPrimary: key === '_id'
          }))
        : []
      
      return {
        tableName: collection,
        columns
      }
    }))
  }
  async executeQuery(connection: MongoClient, query: string) {
    try {
      const cleanedQuery = query.trim().replace('```sql', '').replace('```', '');
      const res = await connection.db().command({ eval: cleanedQuery });
      return {success: true, data: res}
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to execute query' }
    }
  }
}