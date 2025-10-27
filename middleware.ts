export default function middleware() {
  // Middleware logic can be added here if needed
  // API routes handle their own authentication
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}