'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
interface QueryPreviewProps {
  sql: string
}

export function QueryPreview({ sql }: QueryPreviewProps) {
  const [isExecuting, setIsExecuting] = useState(false)

  async function handleExecute() {
    try {
      setIsExecuting(true)
      const response = await fetch('/api/query/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      })

      if (!response.ok) throw new Error('Query execution failed')

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
        disabled={isExecuting}
      >
        {isExecuting ? 'Executing...' : 'Execute Query'}
      </Button>
    </div>
  )
} 