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
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3">
          <DatabaseHeader />

          <Tabs defaultValue="query" className="space-y-5">
            {/* Responsive Tabs */}
            <div className="overflow-x-auto">
              <TabsList className="bg-background border-b border-border/40 w-full justify-start h-12 rounded-none gap-4 sm:gap-10 min-w-max">
                {TABS_CONFIG.map(({ id, label, icon: Icon }) => (
                  <TabsTrigger 
                    key={id}
                    value={id} 
                    className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent px-0 rounded-none whitespace-nowrap"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Query Assistant Tab */}
            <TabsContent value="query" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-3">
                  <Suspense fallback={<DatabaseInfoSkeleton />}>
                    <DatabaseInfo />
                  </Suspense>
                </div>
                <div className="lg:col-span-9">
                  <Suspense fallback={<QueryInterfaceSkeleton />}>
                    <DatabasePrompt />
                  </Suspense>
                </div>
              </div>
            </TabsContent>

            {/* Other Tabs */}
            {[
              { value: 'schema', Component: <></>, title: 'Database Schema' },
              { value: 'history', Component: <></>, title: 'Recent Queries' },
              { value: 'settings', Component: <></>, title: 'Database Connection Settings' }
            ].map(({ value, Component, title }) => (
              <TabsContent key={value} value={value}>
                <Card className="border-primary/20">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-lg font-medium mb-4">{title}</h3>
                    <Suspense fallback={<ContentSkeleton />}>
                      <></>
                    </Suspense>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
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