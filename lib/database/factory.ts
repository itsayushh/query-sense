import { DatabaseType } from '@/types/Database'
import { PostgresConnection } from './connection/postgresql'
import { MySQLConnection } from './connection/mysql'
import { MongoDBConnection } from './connection/mongodb'
import { SQLiteConnection } from './connection/sqlite'

export class DatabaseFactory {
  private static connections = {
    postgresql: new PostgresConnection(),
    mysql: new MySQLConnection(),
    mongodb: new MongoDBConnection(),
    sqlite: new SQLiteConnection()
  }

  static getConnection(type: DatabaseType) {
    const connection = this.connections[type]
    if (!connection) {
      throw new Error(`Unsupported database type: ${type}`)
    }
    return connection
  }
}
