import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'
import { DatabaseConnectionConfig, TableSchema } from '@/types/Database'

export class QueryGenerator {
  private genAI: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async generateQuery(
    config: DatabaseConnectionConfig,
    schemas: TableSchema[],
    prompt: string
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    })

    const context = this.buildContext(config, schemas, prompt)
    const result = await model.generateContent(context)
    const sqlQuery = result.response.text()?.split('SQL:')[1]?.trim() || 
                    result.response.text()?.trim()

    if (!sqlQuery) {
      throw new Error('Failed to generate query')
    }

    return sqlQuery
  }

  private buildContext(
    config: DatabaseConnectionConfig,
    schemas: TableSchema[],
    prompt: string
  ): string {
    const context = `
      You are a SQL query generator assistant. Generate a safe, read-only SQL query based on the following information:

      Database Type: ${config.type}
      Database Name: ${config.method === 'url' ? config.connectionString.split('/').pop()?.split('?')[0] || '' : config.parameters.database}

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
    return context
  }
}