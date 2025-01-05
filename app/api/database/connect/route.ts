import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Client } from 'pg'
import { MongoClient } from 'mongodb'
import mysql from 'mysql2/promise'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'

const connectionSchema = z.object({
  type: z.enum(['mysql', 'postgresql', 'mongodb', 'sqlite']),
  host: z.string(),
  port: z.number(),
  username: z.string(),
  password: z.string(),
  database: z.string(),
})

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
    const body = await request.json()
    const validatedData = connectionSchema.parse(body)
    let tables: string[] = []

    switch (validatedData.type) {
      case 'postgresql': {
        const client = new Client({
          host: validatedData.host,
          port: validatedData.port,
          user: validatedData.username,
          password: validatedData.password,
          database: validatedData.database,
        })
        await client.connect()
        tables = await getTablesList('postgresql', client)
        await client.end()
        break
      }

      case 'mysql': {
        const connection = await mysql.createConnection({
          host: validatedData.host,
          port: validatedData.port,
          user: validatedData.username,
          password: validatedData.password,
          database: validatedData.database,
        })
        await connection.connect()
        tables = await getTablesList('mysql', connection)
        await connection.end()
        break
      }

      case 'mongodb': {
        const url = `mongodb://${validatedData.username}:${validatedData.password}@${validatedData.host}:${validatedData.port}/${validatedData.database}`
        const client = new MongoClient(url)
        await client.connect()
        tables = await getTablesList('mongodb', client)
        await client.close()
        break
      }

      case 'sqlite': {
        const db = new sqlite3.Database(validatedData.database)
        const close = promisify(db.close.bind(db))
        await close()
        tables = await getTablesList('sqlite', db)
        break
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Connection successful',
      data: {
        tables,
        connectionDetails: {
          type: validatedData.type,
          host: validatedData.host,
          port: validatedData.port,
          database: validatedData.database,
        }
      }
    })
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