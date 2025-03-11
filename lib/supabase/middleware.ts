import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { trackQueryUsage } from './queryUsage'
import { ipAddress } from '@vercel/functions';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if the request is for query generation
  const isQueryGenerationRoute = request.nextUrl.pathname === '/api/query/generate'

  if (isQueryGenerationRoute && !user) {
    const ip = ipAddress(request) || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip')

    console.log('Query generation route, IP address:', ip)
    if(!ip) {
      console.log('IP address not found, redirecting to auth page')
      const url = request.nextUrl.clone()
      url.pathname = '/auth'
      return NextResponse.redirect(url)
    }
    // Track query usage for unauthenticated users
    const queryUsage = await trackQueryUsage(ip)
    console.log('Query usage:', queryUsage)

    if (!queryUsage.allowed) {
      console.log('Query usage limit exceeded, redirecting to auth page')
      return NextResponse.json({ success:false, message: 'Query limit exceeded please sign in to continue' }, { status: 403 });
    }
  }

  else if (
    !user &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    console.log('No user found, redirecting to login page')
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}