'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { Button } from './ui/button'
import { LogOut, Home, Database, Settings, LucideIcon, User } from 'lucide-react'
import { ThemeToggle } from './ui/theme-toggle'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from './ui/dropdown-menu'
import { Avatar, AvatarFallback } from './ui/avatar'
import { useAuth } from '@/utils/auth-context'

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
  const { user, profile, isLoading, signOut } = useAuth()

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '?'
    
    if (profile?.full_name) {
      const names = profile.full_name.split(' ')
      return names.map((name: string) => name[0].toUpperCase()).join('')
    }
    
    return user.email?.substring(0, 2).toUpperCase() || '?'
  }

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

  // Handle logout
  const handleLogout = async () => {
    await signOut()
  }

  // Don't render anything while loading
  if (isLoading) return null

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
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="rounded-full p-0 w-8 h-8">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/30 hover:bg-primary/30 text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-0 py-1.5 text-xs font-medium text-muted-foreground">
                {user.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="h-3 w-3 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="h-3 w-3 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="h-3 w-3 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="outline" 
            className="text-sm"
            onClick={() => router.push('/auth')}
          >
            Log in
          </Button>
        )}
      </div>
    </nav>
  )
}

export default Navbar