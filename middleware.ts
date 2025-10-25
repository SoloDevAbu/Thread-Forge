import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (req.nextUrl.pathname === '/' || 
            req.nextUrl.pathname.startsWith('/auth') ||
            req.nextUrl.pathname.startsWith('/api/auth') ||
            req.nextUrl.pathname.startsWith('/_next') ||
            req.nextUrl.pathname.startsWith('/favicon.ico') ||
            req.nextUrl.pathname.startsWith('/firebase-messaging-sw.js')) {
          return true
        }
        
        // Require authentication for API routes that need it
        if (req.nextUrl.pathname.startsWith('/api/generate') ||
            req.nextUrl.pathname.startsWith('/api/generations')) {
          return !!token
        }
        
        // Allow all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}