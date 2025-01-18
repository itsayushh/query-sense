import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'
import { DatabaseConnectionConfig, TableSchema } from '@/types/Database'

export class QueryGenerator {
  private genAI: GoogleGenerativeAI
  private temperature = 0.2

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async generateQuery(
    config: DatabaseConnectionConfig,
    schemas: TableSchema[],
    prompt: string,
    options?: {
      useRefinedContext?: boolean;
      previousError?: string;
    }
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: "gemini-pro",
      generationConfig: {
        temperature: this.temperature,
        topK: 1,
        topP: 0.1,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    })
    const context = options?.useRefinedContext && options?.previousError
      ? this.buildRefinedContext(
          this.buildContext(config, schemas, prompt),
          options.previousError
        )
      : this.buildContext(config, schemas, prompt)
    console.log('Context gen:', context)
    try {
      const result = await model.generateContent(context)
      return result.response.text()
    } catch (error) {
      if (!options?.useRefinedContext) {
        console.log('First attempt failed:', error)
        const refinedContext = this.buildRefinedContext(context, error as string)
        const retryResult = await model.generateContent(refinedContext)
        return retryResult.response.text()
      }
      throw error
    }
  }
  
  private buildRefinedContext(originalContext: string, error: string): string {
    return `
  ${originalContext}
  
  The previous query failed with the following error:
  ${error}
  
  Please generate a new query that addresses this error by:
  1. Checking column names and types carefully
  2. Ensuring proper table relationships in JOINs
  3. Adding appropriate type casting if needed
  4. Using simpler query structure if possible
  5. Following the exact schema provided
  6. Handling NULL values appropriately
  7. Ensuring proper date/time format handling
  
  The new query should be more robust and handle the specific error mentioned above.
  `
  }

  private buildContext(
    config: DatabaseConnectionConfig,
    schemas: TableSchema[],
    prompt: string
  ): string {
    const schemaDetails = schemas.map(schema => {
      const columnDetails = schema.columns
        .map(col => `    - ${col.name} (${col.type})${col.isPrimary ? ' PRIMARY KEY' : ''}`)
        .join('\n')

      return `
  Table: ${schema.tableName}
  Columns:
${columnDetails}
`
    }).join('\n')
    
    return `
You are a precise SQL query generator. Generate a secure, read-only SQL query based on the following:

Database Type: ${config.type}
Database Name: ${config.method === 'url' ? config.connectionString.split('/').pop()?.split('?')[0] || '' : config.parameters.database}

Available Schema:
${schemaDetails}

User Request: "${prompt}"

Requirements:
1. Use ONLY the columns and tables listed above
2. Use proper table aliases (e.g., 't1', 't2') for better readability
3. Include appropriate JOINs with explicit conditions
4. Add WHERE clauses to filter data as needed
5. Format the query with clear indentation
6. Ensure the query is read-only (SELECT only)

Example Format:
\`\`\`sql
SELECT 
    t1.column1,
    t2.column2
FROM table1 t1
JOIN table2 t2 ON t1.id = t2.table1_id
WHERE t1.status = 'active'
\`\`\`

Generate the query now:
`
  }
}