'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { Button } from './ui/button'
import { LogOut, Home, Database, Settings, LucideIcon, User } from 'lucide-react'
import { ThemeToggle } from './ui/theme-toggle'
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'

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
  const router = useRouter()

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
    items: []
  }


  return (
    <nav className="flex items-center justify-between p-4 border-b border-border/40">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <h1 className="flex flex-row text-xl font-bold">Query<p className='text-primary'>Sense</p></h1>
        </Link>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {currentBreadcrumb.items.map((item: BreadcrumbItem, index: number) => {
            const Icon = item.icon
            const isLast = index === currentBreadcrumb.items.length - 1

            return (
              <React.Fragment key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-1 
                    ${isLast ? 'text-foreground' : 'hover:text-primary transition-colors'}
                  `}
                >
                  <Icon className="h-3 w-3" />
                  {item.label}
                </Link>
                {!isLast && <ChevronRight className="h-3 w-3" />}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Conditional Buttons */}
        {pathname === '/databases' && (
          <Button variant="ghost" size="sm" className='flex items-center gap-1 text-xs' onClick={() => router.push('/')}>
            <ChevronLeft className="h-3 w-3" />
            Back
          </Button>
        )}

        {pathname === '/databases/view' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/databases')}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-1 text-xs"
          >
            <LogOut className="h-3 w-3" />
            Disconnect
          </Button>
        )}

        <ThemeToggle />

        {/* Authentication */}
        <SignedOut>
          <SignInButton >
            <Button
              variant="outline"
              className="text-sm"
            >
              Log in
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  )
}

export default Navbar