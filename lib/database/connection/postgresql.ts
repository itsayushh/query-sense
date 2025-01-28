import { Client } from 'pg'
import { DatabaseConnectionConfig, TableSchema } from '@/types/Database'
import { DatabaseConnection } from './base'

export class PostgresConnection extends DatabaseConnection {
  async connect(config: DatabaseConnectionConfig) {
    const connection = config.method === 'url'
      ? new Client(config.connectionString)
      : new Client({
          host: config.parameters!.host,
          port: config.parameters!.port,
          user: config.parameters!.username,
          password: config.parameters!.password,
          database: config.parameters!.database
        })
    
    await connection.connect()
    return connection
  }

  async disconnect(connection: Client) {
    await connection.end()
  }

  async getDatabase(connection: Client): Promise<string[]> {
    const result = await connection.query('SELECT datname FROM pg_database WHERE datistemplate = false')
    return result.rows.map(row => row.datname)
  }

  async getTables(connection: Client): Promise<string[]> {
    const result = await connection.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    )
    return result.rows.map(row => row.table_name)
  }

  async getTableSchema(connection: Client, tables: string[]): Promise<TableSchema[]> {
    const client = connection as Client;
            return await Promise.all(tables.map(async (table) => {
              const result = await client.query(`
                SELECT 
                  c.column_name,
                  c.data_type,
                  c.is_nullable,
                  (
                    SELECT TRUE 
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage ku
                      ON tc.constraint_name = ku.constraint_name
                    WHERE tc.constraint_type = 'PRIMARY KEY'
                      AND tc.table_name = c.table_name
                      AND ku.column_name = c.column_name
                  ) as is_primary
                FROM information_schema.columns c
                WHERE c.table_name = $1
                AND c.table_schema = 'public'
                ORDER BY c.ordinal_position
              `, [table]);
      
              return {
                tableName: table,
                columns: result.rows.map(col => ({
                  name: col.column_name,
                  type: col.data_type,
                  nullable: col.is_nullable === 'YES',
                  isPrimary: !!col.is_primary
                }))
              };
            }));
  }
  async executeQuery(connection: Client, query: string) {
    try {
      const cleanedQuery = query.trim().replace('```sql', '').replace('```', '');
      const result = await connection.query(cleanedQuery);
      return { success: true, data: result.rows }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to execute query' }
    }
  }
}