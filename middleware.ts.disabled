/**
 * Next.js Middleware
 * 
 * Protects routes and enforces authentication
 * - /koperasi/* → Requires authentication
 * - /dev/* → Requires DEVELOPER role
 * - /api/auth/* → Public (NextAuth endpoints)
 * - /login, /signup → Public
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Developer routes - require DEVELOPER role
    if (path.startsWith('/dev')) {
      if (token?.role !== 'DEVELOPER') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Supplier routes - require SUPPLIER role
    if (path.startsWith('/koperasi/supplier')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      if (token.role !== 'SUPPLIER' && token.role !== 'DEVELOPER') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Member routes - require USER role (member koperasi)
    if (path.startsWith('/member')) {
      if (token?.role !== 'USER' && token?.role !== 'DEVELOPER') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Koperasi routes - require authentication
    if (path.startsWith('/koperasi')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Supplier-specific routes - only for suppliers
      if (path.startsWith('/koperasi/supplier')) {
        if (token.role !== 'SUPPLIER' && token.role !== 'DEVELOPER') {
          return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
        // Suppliers can access /koperasi/supplier routes
        return NextResponse.next()
      }

      // Block suppliers from accessing other koperasi routes
      if (token.role === 'SUPPLIER') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      // Block members from accessing koperasi routes (they use /member portal)
      if (token.role === 'USER') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }

      // Super admin routes
      if (path.startsWith('/koperasi/super-admin')) {
        if (token.role !== 'SUPER_ADMIN' && token.role !== 'DEVELOPER') {
          return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
      }

      // Admin/Settings routes - only super admin
      if (path.startsWith('/koperasi/settings')) {
        if (token.role !== 'SUPER_ADMIN' && token.role !== 'DEVELOPER') {
          return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
      }

      // Reports - super admin can see all, admin can see own
      if (path.startsWith('/koperasi/reports')) {
        if (token.role !== 'SUPER_ADMIN' && token.role !== 'ADMIN' && token.role !== 'DEVELOPER') {
          return NextResponse.redirect(new URL('/unauthorized', req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Public routes
        if (
          path.startsWith('/api/auth') ||
          path === '/login' ||
          path === '/signup' ||
          path === '/unauthorized' ||
          path === '/' ||
          path.startsWith('/_next') ||
          path.startsWith('/static')
        ) {
          return true
        }

        // Protected routes require token
        if (path.startsWith('/koperasi') || path.startsWith('/dev') || path.startsWith('/supplier') || path.startsWith('/member')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
