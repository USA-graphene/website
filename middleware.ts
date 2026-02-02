import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const host = request.headers.get('host') || ''
    const url = request.nextUrl.clone()

    // Only redirect the old domain (graphene2026.com) to the new domain
    // Canonical tags will handle www vs non-www preference
    if (host.includes('graphene2026.com')) {
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

