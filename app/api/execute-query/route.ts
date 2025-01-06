import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'
import { Client } from 'pg'
import { MongoClient } from 'mongodb'
import mysql from 'mysql2/promise'
import sqlite3 from 'sqlite3'
import { promisify } from 'util'

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

async function getTableSchema(connectionDetails: any): Promise<TableSchema[]> {
  const { type, host, port, username, password, database, tables } = connectionDetails

  switch (type) {
    case 'postgresql': {
      const client = new Client({
        host, port, user: username, password, database
      })
      await client.connect()
      
      const schemas = await Promise.all(tables.map(async (table: string) => {
        const result = await client.query(`
          SELECT 
            column_name, 
            data_type,
            is_nullable,
            CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary
          FROM information_schema.columns c
          LEFT JOIN (
            SELECT ku.column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage ku
              ON tc.constraint_name = ku.constraint_name
            WHERE tc.constraint_type = 'PRIMARY KEY'
              AND tc.table_name = $1
          ) pk ON c.column_name = pk.column_name
          WHERE table_name = $1
        `, [table])
        
        return {
          tableName: table,
          columns: result.rows.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            isPrimary: col.is_primary
          }))
        }
      }))
      
      await client.end()
      return schemas
    }

    case 'mysql': {
      const connection = await mysql.createConnection({
        host, port, user: username, password, database
      })
      
      const schemas = await Promise.all(tables.map(async (table: string) => {
        const [columns] = await connection.query(`
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
      
      await connection.end()
      return schemas
    }

    case 'mongodb': {
      const url = `mongodb://${username}:${password}@${host}:${port}/${database}`
      const client = new MongoClient(url)
      await client.connect()
      
      const db = client.db(database)
      const schemas = await Promise.all(tables.map(async (collection: string) => {
        // For MongoDB, we'll sample documents to infer schema
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
      
      await client.close()
      return schemas
    }

    case 'sqlite': {
      const db = new sqlite3.Database(database)
      const query = promisify(db.all.bind(db))
      
      const schemas = await Promise.all(tables.map(async (table: string) => {
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
      
      await promisify(db.close.bind(db))()
      return schemas
    }

    default:
      throw new Error(`Unsupported database type: ${type}`)
  }
}

export async function POST(request: Request) {
  try {
    const { prompt, connectionDetails } = await request.json()
    
    // Get table schemas
    const schemas = await getTableSchema(connectionDetails)
    
    // Prepare context for Gemini with more explicit safe SQL generation instructions
    const context = `
      You are a SQL query generator assistant. Generate a safe, read-only SQL query based on the following information:

      Database Type: ${connectionDetails.type}
      Database Name: ${connectionDetails.database}

      Available Tables and their schemas:
      ${schemas.map(schema => `
        Table: ${schema.tableName}
        Columns: ${JSON.stringify(schema.columns, null, 2)}
      `).join('\n')}
      
      User Request: ${prompt}

      Requirements:
      1. Use proper SQL syntax for ${connectionDetails.type}
      2. Include column names explicitly
      3. Use appropriate JOIN conditions if multiple tables are involved
      4. Format the query with proper indentation

      Response format:
      SQL: <your generated query>
    `

    // Generate query using Gemini with safety settings
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
    
    if (!result.response.text()) {
      throw new Error('Failed to generate query')
    }

    // Extract the SQL query from the response
    const responseText = result.response.text()
    const sqlQuery = responseText.includes('SQL:') 
      ? responseText.split('SQL:')[1].trim()
      : responseText.trim()

    return NextResponse.json({
      success: true,
      query: sqlQuery
    })
  } catch (error) {
    console.error('Query generation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error 
          ? error.message 
          : 'Failed to generate query - Please try rephrasing your request'
      },
      { status: 500 }
    )
  }
} 