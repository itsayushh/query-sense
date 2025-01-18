import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DatabaseInfo } from '@/components/database/database-info'
import { DatabasePrompt } from '@/components/database/database-prompt'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { LogOut, DatabaseZap } from 'lucide-react'

export default function DatabasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header with Action Buttons */}
        <header className="relative mb-5 flex items-center justify-between">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-4xl blur-3xl" />
          <div className='relative z-10 space-y-4 py-8'>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-balance">
              Database Management
            </h1>
            <p className="text-muted-foreground text-lg">
              Connect, query, and analyze your database with AI assistance
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="relative z-10 flex gap-3">
            <Link href="/databases">
              <Button variant="destructive" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:gap-8">
          {/* Database Info Section */}
          <section className="relative">
            <Suspense fallback={<DatabaseInfoSkeleton />}>
              <DatabaseInfo />
            </Suspense>
          </section>

          {/* AI Query Section */}
          <section className="relative">
            <DatabasePrompt />
          </section>
        </div>
      </div>
    </div>
  )
}

function DatabaseInfoSkeleton() {
  return (
    <Card className="relative overflow-hidden border-primary/20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <CardHeader className="border-b border-border/40 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-[200px]" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-8 p-6 md:grid-cols-2">
        <div className="space-y-6">
          <Skeleton className="h-6 w-[150px]" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                <Skeleton className="h-6 w-[100px]" />
                <Skeleton className="h-6 w-[150px] bg-primary/10" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-6 w-[150px]" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-10 w-full bg-primary/10" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}