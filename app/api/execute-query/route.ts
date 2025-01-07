import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'
import { Client } from 'pg'
import { MongoClient } from 'mongodb'
import mysql from 'mysql2/promise'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import { getStoredCredentials } from '@/utils/sessionStore'
import { DatabaseConnectionConfig, DatabaseType, ConnectionResult } from "@/types/Database"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface TableSchema {
  tableName: string
  columns: Array<{
    name: string
    type: string
    nullable?: boolean
    isPrimary?: boolean
  }>
}

function getDatabaseName(config: DatabaseConnectionConfig): string {
  switch(config.method) {
    case 'parameters':
      return config.parameters.database
    case 'url':
      return config.connectionString.split('/').pop()?.split('?')[0] || ''
  }
}

async function establishConnection(config: DatabaseConnectionConfig): Promise<ConnectionResult> {
  try {
    let connection: any

    if (config.method === 'url') {
      switch (config.type) {
        case 'postgresql':
          connection = new Client(config.connectionString)
          await connection.connect()
          break
        case 'mysql':
          connection = await mysql.createConnection(config.connectionString)
          break
        case 'mongodb':
          connection = new MongoClient(config.connectionString)
          await connection.connect()
          break
        case 'sqlite':
          connection = new sqlite3.Database(config.connectionString)
          break
      }
    } else {
      switch (config.type) {
        case 'postgresql':
          connection = new Client({
            host: config.parameters.host,
            port: config.parameters.port,
            user: config.parameters.username,
            password: config.parameters.password,
            database: config.parameters.database
          })
          await connection.connect()
          break
        case 'mysql':
          connection = await mysql.createConnection({
            host: config.parameters.host,
            port: config.parameters.port,
            user: config.parameters.username,
            password: config.parameters.password,
            database: config.parameters.database
          })
          break
        case 'mongodb':
          const url = `mongodb://${config.parameters.username}:${encodeURIComponent(config.parameters.password)}@${config.parameters.host}:${config.parameters.port}/${config.parameters.database}`
          connection = new MongoClient(url)
          await connection.connect()
          break
        case 'sqlite':
          connection = new sqlite3.Database(config.parameters.database)
          break
      }
    }

    const tables = await getTablesList(config.type, connection)
    return { success: true, connection, tables }
  } catch (error) {
    return { 
      success: false, 
      connection: null, 
      tables: [],
      error: error instanceof Error ? error.message : 'Connection failed'
    }
  }
}

async function getTablesList(type: DatabaseType, connection: any): Promise<string[]> {
  switch (type) {
    case 'postgresql': {
      const result = await (connection as Client).query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      )
      return result.rows.map(row => row.table_name)
    }
    case 'mysql': {
      const [rows] = await (connection as mysql.Connection).query('SHOW TABLES')
      return (rows as any[]).map(row => Object.values(row)[0] as string)
    }
    case 'mongodb': {
      const collections = await (connection as MongoClient).db().listCollections().toArray()
      return collections.map(col => col.name)
    }
    case 'sqlite': {
      return new Promise((resolve, reject) => {
        ;(connection as sqlite3.Database).all(
          "SELECT name FROM sqlite_master WHERE type='table'",
          (err, tables: Array<{name: string}>) => {
            if (err) reject(err)
            resolve(tables.map(t => t.name))
          }
        )
      })
    }
  }
}

async function getTableSchema(
    config: DatabaseConnectionConfig,
    tables: string[],
    connection: any
  ): Promise<TableSchema[]> {
    switch (config.type) {
        case 'postgresql': {
            const client = connection as Client;
            return await Promise.all(tables.map(async (table) => {
              // Fixed PostgreSQL schema query
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
  
      case 'mysql': {
        const conn = connection as mysql.Connection
        const database = config.method === 'parameters' ? config.parameters.database : 
          config.connectionString?.split('/').pop()?.split('?')[0]
        
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
  
      case 'mongodb': {
        const client = connection as MongoClient
        const database = config.method === 'parameters' ? config.parameters.database :
          config.connectionString?.split('/').pop()?.split('?')[0]
        
        if (!database) throw new Error('Database name not found in connection config')
        
        const db = client.db(database)
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
  
      case 'sqlite': {
        const db = connection as sqlite3.Database
        const query = promisify(db.all.bind(db))
        
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
  
      default:
        throw new Error(`Unsupported database type: ${config.type}`)
    }
  }

async function closeConnection(type: DatabaseType, connection: any): Promise<void> {
  switch (type) {
    case 'postgresql':
      await (connection as Client).end()
      break
    case 'mysql':
      await (connection as mysql.Connection).end()
      break
    case 'mongodb':
      await (connection as MongoClient).close()
      break
    case 'sqlite':
      await promisify((connection as sqlite3.Database).close.bind(connection))()
      break
  }
}

export async function POST(request: Request) {
  let connection: any = null
  let config: DatabaseConnectionConfig | null = null
  
  try {
    const { prompt, tables } = await request.json()
    config = await getStoredCredentials()
    
    if (!config) {
      throw new Error('Database connection not found')
    }

    const connResult = await establishConnection(config)
    if (!connResult.success) {
      throw new Error(connResult.error)
    }
    
    connection = connResult.connection
    const schemas = await getTableSchema(config, tables, connection)
    
    const context = `
      You are a SQL query generator assistant. Generate a safe, read-only SQL query based on the following information:

      Database Type: ${config.type}
      Database Name: ${getDatabaseName(config)}

      Available Tables and their schemas:
      ${schemas.map(schema => `
        Table: ${schema.tableName}
        Columns: ${JSON.stringify(schema.columns, null, 2)}
      `).join('\n')}
      
      User Request: ${prompt}

      Requirements:
      1. Use proper SQL syntax for ${config.type}
      2. Include column names explicitly
      3. Use appropriate JOIN conditions if multiple tables are involved
      4. Format the query with proper indentation

      Response format:
      SQL: <your generated query>
    `

    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    })

    const result = await model.generateContent(context)
    const sqlQuery = result.response.text()?.split('SQL:')[1]?.trim() || result.response.text()?.trim()

    if (!sqlQuery) {
      throw new Error('Failed to generate query')
    }

    return NextResponse.json({ success: true, query: sqlQuery })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to generate query'
      },
      { status: 500 }
    )
  } finally {
    if (connection && config) {
      try {
        await closeConnection(config.type, connection)
      } catch (error) {
        console.error('Error closing connection:', error)
      }
    }
  }
}