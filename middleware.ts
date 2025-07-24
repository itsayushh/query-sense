import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/databases'])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  
  // If user is authenticated, allow access to all routes
  if (userId) {
    return NextResponse.next()
  }

  // For unauthenticated users, check if they're accessing protected routes
  if (isProtectedRoute(req)) {
    // Check for free queries in cookies/headers
    const freeQueriesUsed = req.cookies.get('free_queries_used')?.value || '0'
    const hasUsedAllFreeQueries = parseInt(freeQueriesUsed) >= 5

    // If they've used all free queries, redirect to sign-in
    if (hasUsedAllFreeQueries) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}