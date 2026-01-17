import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const host = request.headers.get('host')

    // If we are already on the canonical apex domain, don't do anything.
    // This is the safest way to prevent any potential loops.
    if (host === 'usa-graphene.com') {
        return NextResponse.next()
    }

    // Only redirect if we are on the old domain or the www subdomain.
    if (host === 'www.usa-graphene.com' || host?.includes('graphene2026.com')) {
        const url = request.nextUrl.clone()
        url.host = 'usa-graphene.com'
        url.protocol = 'https'
        return NextResponse.redirect(url, 301)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next (internal technical files)
         * - static files (images, etc)
         * - favicon.ico, sitemap.xml, robots.txt
         */
        '/((?!api|_next|static|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
}
