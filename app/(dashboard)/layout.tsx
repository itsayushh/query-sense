import React, { Suspense } from 'react'
import Navbar from '@/components/navbar'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className={cn(
      'flex flex-col min-h-screen',
      'bg-background text-foreground'
    )}>
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
          {children}
      </main>
    </div>
  )
}

