import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const host = request.headers.get('host') || ''
    const url = request.nextUrl.clone()

    // Redirect the old domain (graphene2026.com) OR non-www to the new www domain
    // Custom 301 redirect to avoid Vercel's default 307 or redirect chains
    if (host.includes('graphene2026.com') || host === 'usa-graphene.com') {
        url.host = 'www.usa-graphene.com'
        url.protocol = 'https'
        return NextResponse.redirect(url.toString(), 301)
    }

    const wpDatePattern = /^\/(\d{4})\/(\d{2})\/(\d{2})\/([^\/]+)\/?$/
    const match = url.pathname.match(wpDatePattern)
    
    // DEBUG: console.log('Middleware hit:', url.pathname, 'Match:', !!match)

    if (match) {
        const slug = match[4]
        // Use an absolute URL for the destination to be safe
        const destination = new URL(`/blog/${slug}/`, request.url)
        return NextResponse.redirect(destination, 301)
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

