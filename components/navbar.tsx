'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { Button } from './ui/button'
import { LogOut, Home, Database, Settings,LucideIcon } from 'lucide-react'

interface BreadcrumbItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface BreadcrumbConfig {
  [key: string]: {
    items: BreadcrumbItem[];
  };
}

function Navbar() {
  const pathname = usePathname()

  // Breadcrumb configuration
  const breadcrumbConfig: BreadcrumbConfig = {
    '/databases': {
      items: [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Database Connection', href: '/databases', icon: Database }
      ]
    },
    '/databases/view': {
      items: [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Database Connection', href: '/databases', icon: Database },
        { label: 'Database Management', href: '/databases/view', icon: Settings }
      ]
    },
    '/queries': {
      items: [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Queries', href: '/queries', icon: Settings }
      ]
    }
  }

  // Get the current breadcrumb configuration
  const currentBreadcrumb = breadcrumbConfig[pathname] || {
    items: [
      { label: 'Home', href: '/dashboard', icon: Home },
    ]
  }

  return (
    <nav className="flex items-center justify-between py-3 px-8 border-b border-border/40">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {currentBreadcrumb.items.map((item:BreadcrumbItem, index: number) => {
          const Icon = item.icon
          const isLast = index === currentBreadcrumb.items.length - 1
          
          return (
            <React.Fragment key={item.href}>
              <Link 
                href={item.href} 
                className={`
                  flex items-center gap-2 
                  ${isLast ? 'text-foreground' : 'hover:text-primary transition-colors'}
                `}
              >
                <Icon className="h-4 w-4 mr-1" />
                {item.label}
              </Link>
              {!isLast && <ChevronRight className="h-4 w-4" />}
            </React.Fragment>
          )
        })}
      </div>

      {/* Back to Dashboard button on Database Connection page */}
      {pathname === '/databases' && (
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className='flex hover:gap-3 transition-all hover:bg-primary/30'>
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      )}

      {/* Disconnect button only on database view page */}
      {pathname === '/databases/view' && (
        <Link href="/databases">
          <Button variant="outline" size="sm" className="text-red-500 hover:text-white hover:bg-primary/30 flex hover:gap-3 transition-all">
            <LogOut className="h-4 w-4" />
            Disconnect
          </Button>
        </Link>
      )}
    </nav>
  )
}

export default Navbar