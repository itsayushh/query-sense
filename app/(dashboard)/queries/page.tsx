import { PromptInput } from '@/components/query/prompt-input'
import { QueryPreview } from '@/components/query/query-preview'

export default function QueriesPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Query Assistant</h1>
        <p className="text-gray-500">
          Generate SQL queries using natural language prompts.
        </p>
      </div>
      
      <div className="grid gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Natural Language Prompt</h2>
          <PromptInput />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Generated Query</h2>
          <QueryPreview sql="SELECT * FROM users WHERE created_at > NOW() - INTERVAL '1 year'" />
        </div>
      </div>
    </div>
  )
} 