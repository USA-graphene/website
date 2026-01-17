import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || ''
    const pathname = request.nextUrl.pathname
    const searchParams = request.nextUrl.search

    // Source and Target domains
    const oldDomain = 'graphene2026.com'
    const canonicalDomain = 'usa-graphene.com'

    // 1. Cross-domain redirect (Old Domain -> New Domain)
    if (hostname.includes(oldDomain)) {
        return NextResponse.redirect(
            `https://${canonicalDomain}${pathname}${searchParams}`,
            301
        )
    }

    // 2. Canonical Domain Normalization (www -> non-www)
    if (hostname === `www.${canonicalDomain}`) {
        return NextResponse.redirect(
            `https://${canonicalDomain}${pathname}${searchParams}`,
            301
        )
    }

    return NextResponse.next()
}

// Only run on page routes, avoid static assets and internal Next.js paths
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
