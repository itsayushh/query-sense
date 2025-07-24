import React from 'react'
import { SignedOut, SignInButton, useUser } from '@clerk/nextjs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useFreeQueries } from '@/contexts/FreeQueryContext'
import { Zap, UserPlus, AlertTriangle, Clock } from 'lucide-react'

interface FreeQueryStatusProps {
    variant?: 'badge' | 'alert'
    showLoginButton?: boolean
}

export function FreeQueryStatus({
    variant = 'badge',
    showLoginButton = true
}: FreeQueryStatusProps) {
    const { isSignedIn } = useUser()
    const { remainingQueries, hasExhaustedQueries, isLoading } = useFreeQueries()

    // Don't show anything if user is signed in
    if (isSignedIn) return null

    if (isLoading) {
        return (
            <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3 animate-spin" />
                Loading...
            </Badge>
        )
    }

    if (variant === 'badge') {
        return (
            <div className="flex items-center gap-2">
                <Badge
                    variant={hasExhaustedQueries ? "destructive" : "secondary"}
                    className="flex items-center gap-1"
                >
                    <Zap className="h-3 w-3" />
                    {remainingQueries} free queries left
                </Badge>
                {hasExhaustedQueries && showLoginButton && (
                    <SignedOut>
                                          <SignInButton >
                                            <Button
                                              variant="outline"
                                              className="text-sm"
                                            >
                                              Sign In
                                            </Button>
                                          </SignInButton>
                                        </SignedOut>
                )}
            </div>
        )
    }

    // Alert variant for exhausted queries
    if (hasExhaustedQueries) {
        return (
            <Alert className="border-destructive/20 bg-destructive/5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                    <div className="space-y-3">
                        <p className="font-medium">You've used all your free queries!</p>
                        <p className="text-sm">
                            Sign in to get unlimited access to QuerySense.
                        </p>
                        {showLoginButton && (
                            <div className="flex gap-2">
                                <SignedOut>
                                          <SignInButton >
                                            <Button
                                              variant="outline"
                                              className="text-sm"
                                            >
                                              Sign In
                                            </Button>
                                          </SignInButton>
                                        </SignedOut>
                            </div>
                        )}
                    </div>
                </AlertDescription>
            </Alert>
        )
    }

    return null
}
