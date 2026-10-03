import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Public paths
    if (pathname === '/login' || pathname === '/api/auth') {
      return NextResponse.next()
    }

    // Role-based access control
    if (token?.role) {
      const role = token.role as string

      // Admin-only routes
      if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      // Staff and Admin can access staff routes
      if (pathname.startsWith('/staff') && role === 'STUDENT') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/staff/:path*',
    '/reservations/:path*',
    '/equipment/:path*',
    '/waivers/:path*',
    '/api/reservations/:path*',
    '/api/equipment/:path*',
    '/api/waivers/:path*',
  ],
}
