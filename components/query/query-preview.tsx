'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { useFreeQueries } from '@/contexts/FreeQueryContext'

interface QueryPreviewProps {
  sql: string
}

export function QueryPreview({ sql }: QueryPreviewProps) {
  const { isSignedIn } = useUser()
  const { canMakeQuery, consumeQuery } = useFreeQueries()
  const [isExecuting, setIsExecuting] = useState(false)

  async function handleExecute() {
    // Check if user can make a query
    if (!canMakeQuery) {
      toast({
        title: 'Query Limit Reached',
        description: 'You have used all your free queries. Please sign in to continue.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsExecuting(true)
      const response = await fetch('/api/query/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Query execution failed')
      }

      // Consume free query if suggested by API
      if (data.shouldConsumeQuery) {
        consumeQuery()
      }

      toast({ title: 'Success', description: 'Query executed successfully' })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="space-y-4">
      <pre className="p-4 rounded-lg bg-muted overflow-x-auto">
        <code>{sql}</code>
      </pre>
      <Button 
        onClick={handleExecute} 
        disabled={isExecuting || !canMakeQuery}
      >
        {isExecuting ? 'Executing...' : 
         !canMakeQuery ? 'Sign In Required' : 
         'Execute Query'}
      </Button>
    </div>
  )
} 