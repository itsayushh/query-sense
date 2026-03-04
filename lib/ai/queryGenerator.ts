import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, ChatSession } from '@google/generative-ai'
import { DatabaseConnectionConfig, TableSchema } from '@/types/Database'

export class QueryGenerator {
  private genAI: GoogleGenerativeAI
  private temperature = 0.2
  private chatSession: ChatSession | null = null
  private currentConfig: DatabaseConnectionConfig | null = null
  private currentSchemas: TableSchema[] = []

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  /**
   * Initialize or update the conversation context with database schema
   */
  async initializeContext(config: DatabaseConnectionConfig, schemas: TableSchema[]): Promise<void> {
    // Check if we need to reinitialize (different database or schema changes)
    const needsReinit = !this.chatSession || 
                       !this.currentConfig || 
                       JSON.stringify(this.currentConfig) !== JSON.stringify(config) ||
                       JSON.stringify(this.currentSchemas) !== JSON.stringify(schemas)

    if (needsReinit) {
      this.currentConfig = config
      this.currentSchemas = schemas
      
      const model = this.genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite',
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
        systemInstruction: this.buildSystemInstruction(config, schemas)
      })

      // Start a new chat session
      this.chatSession = model.startChat({
        history: [],
      })

      console.log('Chat session initialized with new database context')
    }
  }

  /**
   * Generate SQL query using conversation context
   */
  async generateQuery(
    config: DatabaseConnectionConfig,
    schemas: TableSchema[],
    prompt: string,
    options?: {
      useRefinedContext?: boolean;
      previousError?: string;
    }
  ): Promise<string> {
    // Initialize context if needed
    await this.initializeContext(config, schemas)

    if (!this.chatSession) {
      throw new Error('Chat session not initialized')
    }

    try {
      let message = prompt

      // If there was a previous error, include it in the message
      if (options?.previousError) {
        message = this.buildErrorRefinedMessage(prompt, options.previousError)
      }
      console.log('Generating query with message:', message)
      const result = await this.chatSession.sendMessage(message)
      return result.response.text()

    } catch (error) {
      if (!options?.useRefinedContext && !options?.previousError) {
        console.log('First attempt failed:', error)
        // Retry with error context
        const refinedMessage = this.buildErrorRefinedMessage(prompt, error as string)
        const retryResult = await this.chatSession.sendMessage(refinedMessage)
        return retryResult.response.text()
      }
      throw error
    }
  }

  /**
   * Add context about query execution results to the conversation
   */
  async addExecutionFeedback(query: string, success: boolean, errorMessage?: string): Promise<void> {
    if (!this.chatSession) return

    const feedbackMessage = success 
      ? `✅ Query executed successfully: ${query}`
      : `❌ Query failed with error: ${errorMessage}\nQuery: ${query}`

    try {
      await this.chatSession.sendMessage(feedbackMessage)
    } catch (error) {
      console.warn('Failed to add execution feedback:', error)
    }
  }

  /**
   * Reset the conversation context (useful for new database connections)
   */
  resetContext(): void {
    this.chatSession = null
    this.currentConfig = null
    this.currentSchemas = []
  }

  /**
   * Get conversation history (useful for debugging)
   */
  getConversationHistory() {
    return this.chatSession?.getHistory() || []
  }

  private buildSystemInstruction(config: DatabaseConnectionConfig, schemas: TableSchema[]): string {
    const schemaDetails = schemas.map(schema => {
      const columnDetails = schema.columns
        .map(col => `    - ${col.name} (${col.type})${col.isPrimary ? ' PRIMARY KEY' : ''}${col.nullable ? ' NULLABLE' : ' NOT NULL'}`)
        .join('\n')

      return `Table: ${schema.tableName}
Columns:
${columnDetails}`
    }).join('\n\n')

    const databaseName = config.method === 'url' 
      ? config.connectionString.split('/').pop()?.split('?')[0] || '' 
      : config.parameters.database

    return `You are a precise SQL query generator for a ${config.type} database.

DATABASE CONTEXT:
- Database Type: ${config.type}
- Database Name: ${databaseName}

AVAILABLE SCHEMA:
${schemaDetails}

CORE INSTRUCTIONS:
1. Generate ONLY read-only SQL queries (SELECT statements only)
2. Use ONLY the columns and tables listed in the schema above
3. Use proper table aliases (e.g., t1, t2) for better readability
4. Include appropriate JOINs with explicit ON conditions
5. Add WHERE clauses to filter data as needed
6. Format queries with clear indentation
7. Handle NULL values appropriately
8. Use proper data type casting when necessary
9. Consider database-specific syntax for ${config.type}

RESPONSE FORMAT:
Always wrap your SQL query in markdown code blocks like this:
\`\`\`sql
SELECT 
    t1.column1,
    t2.column2
FROM table1 t1
JOIN table2 t2 ON t1.id = t2.table1_id
WHERE t1.status = 'active'
ORDER BY t1.created_at DESC
\`\`\`

CONVERSATION CONTEXT:
- You will remember previous queries and their outcomes
- Learn from any execution errors to improve subsequent queries
- Build upon previous conversations to understand the user's data exploration patterns
- Suggest improvements or alternatives based on conversation history

When a user asks for a query, respond with just the SQL query in the format specified above. If you need clarification, ask specific questions about the requirements.`
  }

  private buildErrorRefinedMessage(originalPrompt: string, error: string): string {
    return `The previous query failed with this error: ${error}

Please generate a new query for the original request: "${originalPrompt}"

Address the error by:
1. Checking column names and types carefully against the schema
2. Ensuring proper table relationships in JOINs
3. Adding appropriate type casting if needed
4. Using simpler query structure if possible
5. Following the exact schema provided
6. Handling NULL values appropriately
7. Ensuring proper date/time format handling for ${this.currentConfig?.type}

Generate a more robust query that handles the specific error mentioned above.`
  }
}