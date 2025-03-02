import { Suspense, lazy } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Settings,
  History,
  Code2,
  TableProperties
} from 'lucide-react'
import { getStoredCredentials } from '@/utils/sessionStore'
import { DatabaseHeader } from '@/components/database/database-header'

// Lazy load components that aren't immediately visible
const DatabaseInfo = lazy(() => import('@/components/database/database-info'))
const DatabasePrompt = lazy(() => import('@/components/database/database-prompt'))



// Tab configuration for better maintainability
const TABS_CONFIG = [
  { id: 'query', label: 'Query Assistant', icon: Code2 },
  { id: 'schema', label: 'Schema Explorer', icon: TableProperties },
  { id: 'history', label: 'Query History', icon: History },
  { id: 'settings', label: 'Connection Settings', icon: Settings }
]

export default async function DatabasePage() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/98 to-background/95">
      <div className="flex flex-col gap-8 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 border-b">
          <DatabaseHeader />
        </div>
        <div className="flex flex-row gap-6">
            <div className="w-[30%]">
              <Suspense fallback={<DatabaseInfoSkeleton />}>
                <DatabaseInfo />
              </Suspense>
            </div>
            <div className="w-[70%]">
              <Suspense fallback={<QueryInterfaceSkeleton />}>
                <DatabasePrompt />
              </Suspense>
            </div>
          </div>
      </div>
    </div>
  )
}

// Skeleton components
function DatabaseInfoSkeleton() {
  return (
    <Card className="border-primary/20">
      <CardContent className="p-4 space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function QueryInterfaceSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}

function ContentSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}