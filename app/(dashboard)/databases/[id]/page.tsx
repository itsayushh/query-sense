import { Suspense } from 'react'
import { DatabasePrompt } from '@/components/database/database-prompt'
import { DatabaseInfo } from '@/components/database/database-info'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface DatabasePageProps {
  searchParams: {
    tables?: string
    type?: string
    host?: string
    port?: string
    database?: string
  }
}

export default function DatabasePage({ searchParams }: DatabasePageProps) {
  const tables = searchParams.tables ? JSON.parse(searchParams.tables) : []
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Suspense fallback={<LoadingSpinner />}>
        <DatabaseInfo 
          type={searchParams.type}
          host={searchParams.host}
          port={searchParams.port}
          database={searchParams.database}
          tables={tables}
        />
      </Suspense>
      <DatabasePrompt />
    </div>
  )
}