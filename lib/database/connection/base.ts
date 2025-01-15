import { DatabaseConnectionConfig, TableSchema } from "@/types/Database";

export abstract class DatabaseConnection {
    abstract connect(config: DatabaseConnectionConfig): Promise<any>
    abstract disconnect(connection: any): Promise<void>
    abstract getTables(connection: any): Promise<string[]>
    abstract getTableSchema(connection: any, tables: string[]): Promise<TableSchema[]>
    abstract executeQuery(connection: any, query: string): Promise<any>
  }