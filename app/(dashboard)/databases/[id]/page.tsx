import { Suspense } from 'react'
import { Card, CardContent, CardHeader} from '@/components/ui/card'
import { DatabaseInfo } from '@/components/database/database-info'
import { DatabasePrompt } from '@/components/database/database-prompt'
import { Skeleton } from '@/components/ui/skeleton'

// Enhanced DatabasePage Component
interface DatabasePageProps {
  searchParams: {
    tables?: string
    type?: string
    host?: string
    port?: string
    database?: string
  }
}

export default async function DatabasePage({ searchParams }: {searchParams: {tables: string}}) {   
  const tables = await searchParams ? JSON.parse(searchParams.tables) : []
  
  return (
    <div className="container mx-auto p-6 space-y-8 bg-primary/10">
      {/* Connection Status Banner */}
      {/* <Alert className="bg-primary/10 border-primary/20">
        <ServerIcon className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary">
          Connected to database successfully
        </AlertDescription>
      </Alert> */}

      <div className="grid gap-8">
        <div className="space-y-8">
          <Suspense fallback={<DatabaseInfoSkeleton />}>
            <DatabaseInfo 
              tables={tables}
            />
          </Suspense>
          <DatabasePrompt />
        </div>

        {/* New Quick Actions Panel
        <Card className="h-fit border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button className="w-full p-3 flex items-center gap-3 rounded-md hover:bg-muted/50 transition-colors">
              <TableIcon className="h-4 w-4 text-primary" />
              <span>View Schema</span>
            </button>
            <button className="w-full p-3 flex items-center gap-3 rounded-md hover:bg-muted/50 transition-colors">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span>Test Connection</span>
            </button>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}

function DatabaseInfoSkeleton() {
    return (
      <Card className="border-border/40">
        <CardHeader className="border-b border-border/40">
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent className="grid gap-8 p-6 md:grid-cols-2">
          <div className="space-y-6">
            <Skeleton className="h-6 w-[150px]" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-6 w-[100px]" />
                  <Skeleton className="h-6 w-[150px]" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-6 w-[150px]" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }