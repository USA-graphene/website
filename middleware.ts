import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const host = request.headers.get('host') || ''
    const url = request.nextUrl.clone()

    // 1. Handle the old domain redirect (graphene2026.com)
    // 2. Handle non-www to www redirect for the main domain
    if (host.includes('graphene2026.com') || host === 'usa-graphene.com') {
        url.host = 'www.usa-graphene.com'
        url.protocol = 'https'
        return NextResponse.redirect(url.toString(), 301)
    }

    return NextResponse.next()
}

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

