import { NextResponse } from 'next/server'
import { Client } from 'pg'
import { MongoClient } from 'mongodb'
import mysql from 'mysql2/promise'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import { storeCredentials } from '@/utils/sessionStore'
import { DatabaseConnectionConfig } from '@/types/Database'
import { createConnectionConfig } from '@/utils/databaseConnection'


async function getTablesList(type: string, connection: any): Promise<string[]> {
    switch (type) {
      case 'postgresql': {
        const client = connection as Client
        const result = await client.query(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        )
        return result.rows.map(row => row.table_name)
      }
      case 'mysql': {
        const conn = connection as mysql.Connection
        const [rows] = await conn.query('SHOW TABLES')
        return (rows as any[]).map(row => Object.values(row)[0] as string)
      }
      case 'mongodb': {
        const client = connection as MongoClient
        const collections = await client.db().listCollections().toArray()
        return collections.map(col => col.name)
      }
      case 'sqlite': {
        const db = connection as sqlite3.Database
        return new Promise((resolve, reject) => {
          db.all(
            "SELECT name FROM sqlite_master WHERE type='table'",
            (err, tables: Array<{name: string}>) => {
              if (err) reject(err)
              resolve(tables.map(t => t.name))
            }
          )
        })
      }
      default:
        return []
    }
  }
  export async function POST(request: Request) {
    try {
      const config: DatabaseConnectionConfig = await request.json()
      let tables: string[] = []
  
      // Create connection based on config type and method
      switch (config.type) {
        case 'postgresql': {
          const connectionConfig = createConnectionConfig(config)
          const client = typeof connectionConfig === 'string'
            ? new Client(connectionConfig)
            : new Client(connectionConfig)
          
          await client.connect()
          tables = await getTablesList('postgresql', client)
          await client.end()
          break
        }
  
        case 'mysql': {
          const connectionConfig = createConnectionConfig(config)
          const connection = typeof connectionConfig === 'string'
            ? await mysql.createConnection(connectionConfig)
            : await mysql.createConnection(connectionConfig)
          
          await connection.connect()
          tables = await getTablesList('mysql', connection)
          console.log(tables,tables.length);
          await connection.end()
          break
        }
  
        case 'mongodb': {
          const connectionString = createConnectionConfig(config)
          const client = new MongoClient(connectionString as string)
          await client.connect()
          tables = await getTablesList('mongodb', client)
          await client.close()
          break
        }
  
        case 'sqlite': {
          const dbPath = createConnectionConfig(config)
          const db = new sqlite3.Database(dbPath as string)
          tables = await getTablesList('sqlite', db)
          const close = promisify(db.close.bind(db))
          await close()
          break
        }
      }
      if (tables.length > 0) {
        // Store credentials securely if connection was successful
        await storeCredentials(config)
        return NextResponse.json({
          success: true,
          message: 'Connection successful',
          tables: tables
        })
      }
  
      throw new Error('No tables found in database')
    } catch (error) {
      console.error('Database connection error:', error)
      return NextResponse.json(
        { 
          success: false, 
          message: error instanceof Error ? error.message : 'Failed to connect to database'
        },
        { status: 500 }
      )
    }
  }