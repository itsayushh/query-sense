import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateSQLFromPrompt(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  
  const result = await model.generateContent(`
    Generate SQL query for the following request. 
    Only return the SQL query, no explanations:
    ${prompt}
  `)
  
  const response = await result.response
  return response.text()
} 