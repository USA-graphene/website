import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host')
    const url = request.nextUrl.clone()

    // 1. Redirect graphene2026.com (and www.graphene2026.com) to usa-graphene.com
    if (hostname && (hostname.includes('graphene2026.com'))) {
        url.host = 'usa-graphene.com'
        url.protocol = 'https'
        return NextResponse.redirect(url, 301)
    }

    // 2. Enforce non-www (Normalize www.usa-graphene.com to usa-graphene.com)
    if (hostname === 'www.usa-graphene.com') {
        url.host = 'usa-graphene.com'
        url.protocol = 'https'
        return NextResponse.redirect(url, 301)
    }

    // 3. Enforce HTTPS (Especially if not handled by provider)
    const xForwardedProto = request.headers.get('x-forwarded-proto')
    if (xForwardedProto === 'http') {
        url.protocol = 'https'
        return NextResponse.redirect(url, 301)
    }

    // 4. Handle trailing slashes (Next.js default is to redirect to non-trailing slash)
    // If the path ends with / and is not just the root, redirect
    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
        url.pathname = url.pathname.slice(0, -1)
        return NextResponse.redirect(url, 301)
    }

    return NextResponse.next()
}

// Only run middleware on pages and blog posts, ignore static assets
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
