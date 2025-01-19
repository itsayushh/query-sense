import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DatabaseInfo } from '@/components/database/database-info'
import { DatabasePrompt } from '@/components/database/database-prompt'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  LogOut, 
  Database, 
  ChevronRight, 
  Settings,
  History,
  Code2,
  TableProperties
} from 'lucide-react'
import { getStoredCredentials } from '@/utils/sessionStore'

export default async function DatabasePage() {
  const dbCredientials = await getStoredCredentials();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/98 to-background/95">
      <div className="max-w-8xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="py-3">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{dbCredientials?.type.toUpperCase()} Database</h1>
                <div className="px-3 py-1 bg-primary/10 rounded-full">
                  <span className="text-sm font-medium text-primary">Connected</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                {dbCredientials?.method === 'parameters' ? (
                  <>
                    {dbCredientials.parameters.host}:{dbCredientials.parameters.port}/{dbCredientials.parameters.database}
                  </>
                ) : (
                  <>
                    {dbCredientials?.connectionString}
                  </>
                ) 
                }
              </p>
            </div>
          </div>

          {/* Main Tabs Interface */}
          <Tabs defaultValue="query" className="space-y-5">
            <TabsList className="bg-background border-b border-border/40 w-full justify-start h-12 rounded-none gap-10">
              <TabsTrigger 
                value="query" 
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent px-0 rounded-none"
              >
                <Code2 className="mr-2 h-4 w-4" />
                Query Assistant
              </TabsTrigger>
              <TabsTrigger 
                value="schema" 
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent px-0 rounded-none"
              >
                <TableProperties className="mr-2 h-4 w-4" />
                Schema Explorer
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent px-0 rounded-none"
              >
                <History className="mr-2 h-4 w-4" />
                Query History
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent border-b-2 border-transparent px-0 rounded-none"
              >
                <Settings className="mr-2 h-4 w-4" />
                Connection Settings
              </TabsTrigger>
            </TabsList>

            {/* Query Assistant Tab */}
            <TabsContent value="query" className="space-y-6 mt-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Left Sidebar - Database Info */}
                <div className="col-span-3">
                  <Suspense fallback={<DatabaseInfoSkeleton />}>
                    <DatabaseInfo />
                  </Suspense>
                </div>
                
                {/* Main Content - Query Interface */}
                <div className="col-span-9">
                  <DatabasePrompt />
                </div>
              </div>
            </TabsContent>

            {/* Schema Explorer Tab */}
            <TabsContent value="schema">
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Database Schema</h3>
                  {/* Add Schema Explorer Component Here */}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Query History Tab */}
            <TabsContent value="history">
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Recent Queries</h3>
                  {/* Add Query History Component Here */}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Connection Settings Tab */}
            <TabsContent value="settings">
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">Database Connection Settings</h3>
                  {/* Add Connection Settings Component Here */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function DatabaseInfoSkeleton() {
  return (
    <Card className="border-primary/20">
      <CardContent className="p-4 space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}