'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

export function DatabasePrompt() {
  const [prompt, setPrompt] = useState('')
  const [generatedQuery, setGeneratedQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setGeneratedQuery('')
    
    try {
      // Get connection details from URL params
      const connectionDetails = {
        type: searchParams.get('type'),
        host: searchParams.get('host'),
        port: Number(searchParams.get('port')),
        username: searchParams.get('username'),
        password: searchParams.get('password'),
        database: searchParams.get('database'),
        tables: JSON.parse(searchParams.get('tables') || '[]')
      }

      const response = await fetch('/api/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          connectionDetails
        }),
      })

      if (!response.ok) throw new Error('Failed to execute query')

      const data = await response.json()
      if (data.success) {
        setGeneratedQuery(data.query)
        toast({
          title: 'Query Generated',
          description: 'SQL query has been generated successfully.',
        })
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate query',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Describe the query you want to execute..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating Query...' : 'Generate Query'}
        </Button>
      </form>

      {generatedQuery && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Generated SQL Query:</h3>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>{generatedQuery}</code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 